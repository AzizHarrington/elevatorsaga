{
    init: function(elevators, floors) {

        // set to true to optimize algorithm for moves
        var optimizeMoves = true;
        // set to true to optimize algorithm for wait
        var optimizeWait = false;

        // check floors & elevators for events
        map(floors, checkForButtonPress);
        map(elevators, checkFloorButton);
        map(elevators, checkPassingFloor);
        if (!optimizeMoves && !optimizeWait) {
            map(elevators, checkForIdle);
        }

        // button pressed at floor
        function checkForButtonPress(floor) {
            floor.on("up_button_pressed down_button_pressed", function() {
                assignElevator(floor);
            });
        }

        // button pressed inside elevator
        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function (floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                }
            });
        }

        // if passing floor in destination queue, lets
        // stop there, then be on our way
        function checkPassingFloor(elevator) {
            elevator.on("passing_floor", function (floorNum, direction) {
                var queue = elevator.destinationQueue;
                var index = queue.indexOf(floorNum);
                if (index > -1) {
                    var floor = floors[floorNum];
                    var goingUp = floor.buttonStates.up === 'activated';
                    var goingDown = floor.buttonStates.down === 'activated';
                    var passengerOnFloor = goingUp || goingDown;
                    var floorInRequests = elevator.getPressedFloors().indexOf(floorNum) > -1;
                    queue.splice(index, 1);
                    elevator.checkDestinationQueue();
                    if (passengerOnFloor || floorInRequests) {
                        elevator.goToFloor(floorNum, true);
                    }
                    // floor was not in requests, and passenger was
                    // not on floor, so we dont do anything with the
                    // floor number, just leave it removed
                }
            });
        }

        // if idle, send back to ground floor
        function checkForIdle(elevator) {
            elevator.on("idle", function () {
                elevator.goToFloor(0);
            });
        }

        // determine best elevator to send
        // based on suitability score
        function assignElevator(floor) {
            var floorNo = floor.floorNum();
            var elevatorScores = map(elevators, scoreElevators);
            var bestScore = reduce(elevatorScores, findBest, null);
            var elevator = bestScore[0];

            elevator.goToFloor(floorNo);

            function findBest(current, elevatorScore) {
                // lower ranking is better
                if (current === null) {
                    return elevatorScore;
                } else if (elevatorScore[1] < current[1]) {
                    return elevatorScore;
                } else {
                    return current;
                }
            }

            function scoreElevators(elevator) {
                var score;
                var queue = elevator.destinationQueue;
                var distanceFromFloor = getDistance();
                var load = elevator.loadFactor();

                score = distanceFromFloor;
                // apply load factor to score
                if (optimizeMoves) {
                    // if move optimization is enabled,
                    // then we only apply factor load
                    // when the elevator is full
                    if (load === 1) {
                        score += (10 * load);
                    // when elevator is partially full,
                    // we give it a lower (better) score
                    } else if (load < 1) {
                        score -= (10 * load);
                    }
                } else {
                    // otherwise apply as normal
                    score += (10 * load);
                }

                return [elevator, score];

                function getDistance() {
                    if (queue.length === 0) {
                        // no destinations scheduled
                        // so lets use current floor
                        return Math.abs(elevator.currentFloor() - floorNo);
                    }
                    // search destination queue
                    // for a stop close to floorNo
                    return reduce(queue, function (current, scheduledLocation) {
                        var distance = Math.abs(scheduledLocation - floorNo);
                        if (current === null) {
                            return distance;
                        } else if (distance < current) {
                            return distance;
                        } else {
                            return current;
                        }
                    }, null);
                }
            }
        }

        //functional array helpers

        function map(array, func) {
            var mapped = [];
            array.forEach(function (element) {
                mapped.push(func(element));
            });
            return mapped;
        }

        function reduce(array, combine, start) {
            var current = start;
            map(array, function (element) {
                current = combine(current, element);
            });
            return current;
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
