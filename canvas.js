(function(){
  'use strict';

  var Wallets = {
    // Here wallets are names, but will actually be eth wallets
    'ContractCreator': 0,
    'Chris': 1000,
    'Jonny': 500,
    'Mike': 100,
  };

// SMART CONTRACT PIECE
  var Pixel = function Pixel(meta, owner, location, price) {
    //Examples in Comments
    // meta = {color:"blue", link:"www.x.com", comment:"X.com"}
    this.meta = meta;
    // owner = walletId
    this.owner = owner;
    // location = [0, 0]
    this.location = location;
    // Price = 0.001 (in Ether)
    this.price = price;
    // cooldownTime = initializes at time pixel was created
    this.cooldownTime = new Date();
  };

// SMART CONTRACT PIECE
  var StandardMethods = function StandardMethods() {}
  StandardMethods.prototype.sendEther = function (from, to, amount) {
    if (Wallets[from] > amount) {
      Wallets[from] -= amount;
      Wallets[to] += amount;
    }
  };
  StandardMethods.prototype.createColorsArray = function (color, size) {
    var result = [];
    for (var i = 0; i < size; i++) {
      result.push(color);
    }
    return result;
  };

// SMART CONTRACT PIECE
  var Canvas = function Canvas() {
    // Store pixels in an array
    this.pixels = [];
    this.standardMethods = new StandardMethods();

    // Play with the display of the Canvas here:
    this.sideLength = 500;
    this.pixelSize = 10;
    this.pixelsPerSide = this.sideLength / this.pixelSize;
  };
  window['Canvas'] = Canvas;

// SMART CONTRACT PIECE
  Canvas.prototype.init = function(opts) {
    this.ownerOnly();

    // Draw initial board
    this.createPixels();
    this.runTestCode();
  };

  Canvas.prototype.ownerOnly = function (rentalFeesExist, rentalFees, buyingFees) {
    // probably very difficult to include rental fees in MVP
    this.rentalFeesExist = false;
    this.rentalFees = 0.001;

    // ContractOwner receives 4% of every buy transaction
    this.buyingFees = 0.04;
  };

  // just for testing different methods
  Canvas.prototype.runTestCode = function () {
    var newMeta1 = {
      colors: this.standardMethods.createColorsArray("red", 10),
      link: "www.a.com",
      comment: "AAA"
    }
    this.buyPixels("Chris", this.pixels.slice(0,10), newMeta1);
    this.rentPixels("Chris", this.pixels.slice(355,365), newMeta1);

    var newMeta2 = {
      colors: this.standardMethods.createColorsArray("orange", 10),
      link: "www.a.com",
      comment: "AAA"
    }
    this.buyPixels("Jonny", this.pixels.slice(0,10), newMeta2)

    this.refreshCanvas();
    console.log(Wallets);
  };

// SMART CONTRACT PIECE
  Canvas.prototype.buyPixels = function (buyer, pixels, newMeta) {
    // buyer is msg.sender in Solidity, not actually required in argument
    // newMeta: { colors: [], link, comments}
    var totalCost = 0;
    for (var i = 0; i < pixels.length; i++) {
      totalCost += pixels[i].price;


      // console.log(pixels[i].cooldownTime)// + "/" + pixels[i].cooldownTime.getDay() + "/" + pixels[i].cooldownTime.getYear())


      totalCost += this.buyingFees;
    }

    // send costs + transaction fees
    if (Wallets[buyer] > totalCost) {
      // this needs to be refactored to be efficient
      for (var i = 0; i < pixels.length; i++) {
        var owner = pixels[i].owner;

        this.standardMethods.sendEther(buyer, owner, pixels[i].price);
        this.standardMethods.sendEther(buyer, 'ContractCreator', pixels[i].price * this.buyingFees);
      }
      this.transferOwnership(buyer, pixels, newMeta);
    } else {
      console.log('not enough in account');
    }
  };

// SMART CONTRACT PIECE
    Canvas.prototype.rentPixels = function (renter, pixels, newMeta) {
      // renter is msg.sender in Solidity, not actually required in argument
      // newMeta: { colors: [], link, comments}
      var totalCost = 0;
      for (var i = 0; i < pixels.length; i++) {
        totalCost += pixels[i].price;
        totalCost += this.buyingFees;
      }

      // send costs + transaction fees
      if (Wallets[renter] > totalCost) {
        // this needs to be refactored to be efficient
        for (var i = 0; i < pixels.length; i++) {
          var owner = pixels[i].owner;

          if (this.rentalFeesExist) {
            // Pixel owner gets rental fees
            this.standardMethods.sendEther(renter, owner, this.rentalFees);
            // Contract creator takes 10%
            this.standardMethods.sendEther(renter, 'ContractCreator', this.rentalFees * 0.1);
          }
        }
        this.transferOwnership(renter, pixels, newMeta);
      } else {
        console.log('not enough in account');
      }
    };

// SMART CONTRACT PIECE
  Canvas.prototype.transferOwnership = function (buyer, pixels, newMeta) {
    for (var i = 0; i < pixels.length; i++) {
      pixels[i].owner = Wallets[buyer];
      pixels[i].meta.color = newMeta.colors[i];
      pixels[i].meta.link = newMeta.link;
      pixels[i].meta.comment = newMeta.comment;
    }
  };

  // Just used to simulate initializing the canvas
  Canvas.prototype.createPixels = function () {
    for (var i = 0; i < this.pixelsPerSide; i++) {
      for (var j = 0; j < this.pixelsPerSide; j++) {
        var meta = {color:"blue", link:"www.cryptocanvas.com", comment:"cryptocanvas"};
        var owner = "ContractCreator";
        var location = [i, j];
        var price = 1;
        this.pixels.push(new Pixel(meta, owner, location, price));
      }
    }
    $('.pixel-count').html('Pixel count:' + this.pixels.length);
    this.refreshCanvas();
  };

  // Just used to simulate refreshing the canvas
  Canvas.prototype.refreshCanvas = function () {
    $('.pixel').remove();
    var totalSquares = this.pixels.length;
    for (var i = 0; i < totalSquares; i++) {
      $('#canvas').append('<div class="pixel" style="background:' + this.pixels[i].meta.color + '"></div>');
    }
    $('.pixel').css('height', this.pixelSize);
    $('.pixel').css('width', this.pixelSize);
    $('#canvas').css('height', this.sideLength);
    $('#canvas').css('width', this.sideLength);
  };
})();
