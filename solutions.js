{
    init: function(elevators, floors) {

        // check floors & elevators for events
        map(floors, checkForButtonPress);
        map(elevators, checkFloorButton);
        map(elevators, checkPassingFloor);
        // seems like most people board at ground floor
        // comment out to optimize for moves
        map(elevators, checkForIdle);

        // button pressed at floor
        function checkForButtonPress(floor) {
            floor.on("up_button_pressed down_button_pressed", function() {
                assignElevator(floor);
            });
        }

        // button pressed inside elevator
        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                }
            });
        }

        // if passing floor in destination queue, lets
        // stop there, then be on our way
        function checkPassingFloor(elevator) {
            elevator.on("passing_floor", function(floorNum, direction) {
                var queue = elevator.destinationQueue;
                var index = queue.indexOf(floorNum);
                //console.log('performing check for ' + floorNum);
                if (index > -1) {
                    queue.splice(index, 1);
                    elevator.goToFloor(floorNum, true);
                }
            });
        }

        // if idle, send back to ground floor
        function checkForIdle(elevator) {
            elevator.on("idle", function() {
                elevator.goToFloor(0, true);
            });
        }

        // determine best elevator to send
        // based on suitability score
        function assignElevator(floor) {
            var floorNo = floor.floorNum();
            var elevatorScores = map(elevators, scoreElevators);
            var bestScore = reduce(elevatorScores, findBest, null);
            console.log('winning score ' + bestScore[1]);
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
                var floorInQueue = queue.indexOf(floorNo) > -1
                var load = elevator.loadFactor();

                if (floorInQueue) {
                    // elevator is going to this floor
                    // so give it best score
                    score = 0;
                } else {
                    // otherwise base score on
                    // how far away it is/will be
                    score = distanceFromFloor;
                }

                console.log('score before ' + score);
                console.log('  load ' + load);

                // apply load factor to score
                score = score + (10 * load);
                console.log('  score after ' + score);

                return [elevator, score];

                function getDistance() {
                    var location;
                    if (queue.length === 0) {
                        location = elevator.currentFloor();
                    } else {
                        location = queue[queue.length - 1];
                    }
                    return Math.abs(location - floorNo);
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
