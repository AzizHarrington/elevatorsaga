{
    init: function(elevators, floors) {
        Array.prototype.max = function() {
          return Math.max.apply(null, this);
        };

        floors.forEach(function (floor) {
            floor.on("up_button_pressed down_button_pressed", function() {
                assignElevator(floor);
            });
        });

        elevators.forEach(function (elevator) {
            checkFloorButton(elevator);
            resetElevator(elevator);
            elevator.destinationQueue.sort();
            elevator.checkDestinationQueue();
        });

        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                }
            });
        }

        function resetElevator(elevator) {
            if (elevator.destinationQueue.length === 0 && elevator.loadFactor() > 0) {
                floors.forEach(function (floor) {
                    elevator.goToFloor(floor.floorNum());
                });
            }
        }

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

                score = distanceFromFloor;
                console.log('score before ' + score);
                console.log('  load ' + load);
                score = score + (10 * load);
                console.log('  score after ' + score);

                return [elevator, score];

                function getDistance() {
                    if (queue.length === 0) {
                        // no destinations scheduled
                        // so lets use current floor
                        return Math.abs(elevator.currentFloor() - floorNo);
                    }
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
            array.forEach(function (element) {
                current = combine(current, element);
            });
            return current;
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
