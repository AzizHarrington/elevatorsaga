{
    init: function(elevators, floors) {
        Array.prototype.max = function() {
          return Math.max.apply(null, this);
        };

        floors.forEach(function (floor) {
            floor.on("up_button_pressed down_button_pressed", function() {
                sendElevator(floor);
            });
        });

        elevators.forEach(function (elevator) {
            checkFloorButton(elevator);
        });

        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                    //sort queue to make sure we visit
                    //each floor in order.
                    elevator.destinationQueue.sort();
                    elevator.checkDestinationQueue();
                }
            });
        }

        function sendElevator(floor) {
            var floorNo = floor.floorNum();
            elevators.forEach(function (elevator) {
                if (elevator.destinationQueue.indexOf(floorNo) === -1 && floorNo != null) {
                    elevator.goToFloor(floorNo);
                    // prevent future floor assignment
                    floorNo = null;
                    // place assigned elevator at end of queue
                    rotateElevators(elevator);
                }
            });
            function rotateElevators(elevator) {
                var index = elevators.indexOf(elevator);
                elevators.splice(index, 1);
                elevators.push(elevator);
            }
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
