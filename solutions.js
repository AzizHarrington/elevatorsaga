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
        });

        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                    //sort queue to make sure we visit
                    //each floor in order.
                    //uncomment to optimize for moves
                    elevator.destinationQueue.sort();
                    elevator.checkDestinationQueue();
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
            var elevator;

            var onFloor = reduce(elevators, checkOnFloor, null);
            var enRoute = reduce(elevators, checkForFloorInQueue, null);
            var lowestLoad = reduce(elevators, checkLoad, null);

            if (onFloor !== null) {
                onFloor.goToFloor(floorNo, true);
            } else if (enRoute !== null) {
                // pass, since elevator is enroute
            } else if (lowestLoad != null) {
                lowestLoad.goToFloor(floorNo);
            } else {
                roundRobin(elevators[0]);
            }

            function checkOnFloor(current, elevator) {
                if (elevator.currentFloor() === floorNo){
                    if (elevator.loadFactor() < 4 && elevator.destinationQueue < 4) {
                        return elevator;
                    }
                }
                    return current;
            }
            function checkForFloorInQueue(current, elevator) {
                if (elevator.destinationQueue.indexOf(floorNo) > -1){
                    if (elevator.loadFactor() < 4 && elevator.destinationQueue < 4) {
                        return elevator;
                    }
                }
                    return current;
            }

            //todo: implement distance check
            function checkDistanceToFloor(current) {}

            function checkLoad(current, elevator) {
                if (current === null) {
                    return elevator;
                } else if (elevator.loadFactor() < current.loadFactor()){
                    return elevator;
                } else {
                    return current;
                }
            }

            function roundRobin(elevator) {
                elevator.goToFloor(floorNo);
                // place assigned elevator at end of queue
                rotateElevators(elevator);
            }
            function rotateElevators(elevator) {
                var index = elevators.indexOf(elevator);
                elevators.splice(index, 1);
                elevators.push(elevator);
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
