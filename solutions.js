{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        startElevator(elevator);

        function startElevator(elevator) {
            elevator.on("idle", function() {
                forEach(floors, function (floor) {
                    checkForPassenger(floor, elevator);
                });
            });
        }

        function checkForPassenger(floor, elevator) {
            floor.on("up_button_pressed down_button_pressed", function () {
                elevator.goToFloor(floor.floorNum())
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
