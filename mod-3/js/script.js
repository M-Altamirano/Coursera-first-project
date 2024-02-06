function Tank (weight) {
    this.weight = weight;
}

Tank.prototype.fire = function () {
    console.log("BOOOOOOOOMMMMM");
}

var myTank = new Tank(78);
console.log(myTank);
myTank.fire();

var newTank = {
    weight: 53,

    getWeight: function () {
        var self = this;
        var increaseWeight = function () {
            self.weight = 105;
        };
        increaseWeight();
        console.log(this.weight);
    }
}

newTank.getWeight();