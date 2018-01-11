(function(){
  'use strict';

  var Wallets = {
    // Here wallets are names, but will actually be eth wallets
    'ContractCreator': 0,
    'Chris': 1000,
    'Jonny': 500,
    'Mike': 10,
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
    this.rentalFeesExist = true;
    this.rentalFees = 0.001;
    this.buyingFees = 0.01;
  };

  // just for testing different methods
  Canvas.prototype.runTestCode = function () {
    var newMeta = {
      colors: [
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
        "red",
      ],
      link: "www.a.com",
      comment: "AAA"
    }
    this.buyPixels("Jonny", this.pixels.slice(30,40), newMeta)
    // this.rentPixels("Jonny", this.pixels.slice(30,40), newMeta);
    this.refreshCanvas();
    console.log(Wallets);
  };

  // Not part of Smart Contract, reading is front end
  // Takes array of pixels and displays information
  Canvas.prototype.displayBulkPurchase = function(pixels) {
    console.log(pixels);
  }

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
        this.standardMethods.sendEther(buyer, 'ContractCreator', this.buyingFees);
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

  // Just used to simulate initializing the board
  Canvas.prototype.createPixels = function () {
    for (var i = 0; i < this.pixelsPerSide; i++) {
      for (var j = 0; j < this.pixelsPerSide; j++) {
        var meta = {color:"blue", link:"www.x.com", comment:"X.com"};
        var owner = "ContractCreator";
        var location = [i, j];
        var price = 1;
        this.pixels.push(new Pixel(meta, owner, location, price));
      }
    }
    this.addSquaresToWindow();
  };

  // Just used to simulate initializing the board
  Canvas.prototype.addSquaresToWindow = function () {
    var totalSquares = this.pixels.length;
    $('.pixel-count').html('Pixel count:' + totalSquares);
    for (var i = 0; i < totalSquares; i++) {
      $('#canvas').append('<div class="pixel" style="background:' + this.pixels[i].meta.color + '"></div>');
    }
    $('.pixel').css('height', this.pixelSize);
    $('.pixel').css('width', this.pixelSize);
    $('#canvas').css('height', this.sideLength);
    $('#canvas').css('width', this.sideLength);
  };

  // Just used to simulate initializing the board
  Canvas.prototype.refreshCanvas = function () {
    $('.pixel').remove();
    var totalSquares = this.pixels.length;
    for (var i = 0; i < totalSquares; i++) {
      $('#canvas').append('<div class="pixel" style="background:' + this.pixels[i].meta.color + '"></div>');
    }
    $('.pixel').css('height', this.pixelSize);
    $('.pixel').css('width', this.pixelSize);
  };
})();
