{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        startElevator(elevator);

        function startElevator(elevator) {
            elevator.on("idle", function() {
                forEach(floors, function (floor) {
                    checkForPassenger(floor, elevator);
                });
                checkFloorButton(elevator);
            });
            checkPassingFloors(elevator);
        }

        function checkPassingFloors(elevator) {
            elevator.on("passing_floor", function(floorNum, direction) {
                decideToStop(elevator, floorNum);
            });
        }

        function decideToStop(elevator, floorNum) {
            var floorIndex = elevator.destinationQueue.indexOf(floorNum);
            console.log("checking queue for floor " + floorNum);
            console.log(elevator.destinationQueue);
            if (floorIndex > -1) {
                elevator.destinationQueue.splice(floorIndex, 1);
                elevator.destinationQueue.unshift(floorIndex);
                elevator.checkDestinationQueue();
                console.log("stopping at " + floorNum);
                console.log(elevator.destinationQueue);
            }
        }

        function checkFloorButton(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) === -1) {
                    elevator.goToFloor(floorNum);
                }
            })
        }

        function checkForPassenger(floor, elevator) {
            floor.on("up_button_pressed down_button_pressed", function () {
                if (elevator.destinationQueue.indexOf(floor.floorNum()) === -1) {
                    elevator.goToFloor(floor.floorNum());
                }
            });
        }

        function forEach(arr, func) {
            for (var i = 0; i < arr.length; i++) {
                func(arr[i]);
            }
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
