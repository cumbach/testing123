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
    // represents a date in time
    this.cooldownTime = 0;
  };

// SMART CONTRACT PIECE
  var StandardMethods = function StandardMethods() {}

  StandardMethods.prototype.sendEther = function (from, transactions) {
    for (var sendTo in transactions) {
      var amount = transactions[sendTo];
      if (Wallets[from] > amount) {
        Wallets[from] -= amount;
        Wallets[sendTo] += amount;
      }
      console.log(from + " paid " + sendTo + " " + amount + " Ether");
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
    this.currentDay = 1;
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
    // WALLETS
    console.log("day " + this.currentDay);
    console.log(Wallets);
    console.log("\n");

    // BUY
    var newMeta1 = {
      colors: this.standardMethods.createColorsArray("red", 10),
      link: "www.a.com",
      comment: "AAA",
      price: 2
    }
    this.buyPixels("Chris", this.pixels.slice(0,10), newMeta1);
    console.log("\n");

    // WALLETS
    console.log(Wallets);
    console.log("\n");

    // RENT
    this.rentPixels("Chris", this.pixels.slice(355,365), newMeta1);
    console.log("\n");

    // WALLETS
    console.log(Wallets);
    console.log("\n");

    // Advance Calendar
    this.currentDay += 10;
    console.log("day " + this.currentDay);
    console.log("\n");

    // BUY
    var newMeta2 = {
      colors: this.standardMethods.createColorsArray("orange", 10),
      link: "www.a.com",
      comment: "AAA",
      price: 3
    }
    this.buyPixels("Jonny", this.pixels.slice(0,10), newMeta2)
    console.log("\n");

    // WALLETS
    console.log(Wallets);
    console.log("\n");

    // Advance Calendar
    this.currentDay += 10;
    console.log("day " + this.currentDay);
    console.log("\n");

    // BUY
    var newMeta3 = {
      colors: this.standardMethods.createColorsArray("green", 10),
      link: "www.b.com",
      comment: "BBB",
      price: 4
    }
    this.buyPixels("Mike", this.pixels.slice(5,15), newMeta3)
    console.log("\n");

    // WALLETS
    console.log(Wallets);
    console.log("\n");

    this.refreshCanvas();
  };



// SMART CONTRACT PIECE
  Canvas.prototype.buyPixels = function (buyer, pixels, newMeta) {
    // buyer is msg.sender in Solidity, not actually required in argument
    // newMeta: { colors: [], link, comments}
    var totalCost = 0;
    var allPixelsAvailable = true;
    for (var i = 0; i < pixels.length; i++) {
      // If any of the pixels are not "stale", break early and cancel buy
      if (pixels[i].cooldownTime > this.currentDay) {
        allPixelsAvailable = false;
        break;
      }

      totalCost += pixels[i].price;
      totalCost += this.buyingFees;
    }

    // send costs + transaction fees
    if (Wallets[buyer] > totalCost && allPixelsAvailable) {
      // this needs to be refactored to be efficient

      var transactions = {};
      for (var i = 0; i < pixels.length; i++) {
        var owner = pixels[i].owner;
        if (typeof transactions[owner] == "undefined") {
          transactions[owner] = pixels[i].price;
        } else {
          transactions[owner] += pixels[i].price;
        }
      }
      this.standardMethods.sendEther(buyer, transactions);
      this.standardMethods.sendEther(buyer, { 'ContractCreator': totalCost * this.buyingFees});

      this.transferOwnership(buyer, pixels, newMeta);
    } else {
      if (allPixelsAvailable) {
        console.log("Buy cancelled: not enough in account");
      } else {
        console.log('Buy cancelled: pixels unavailable');
      }
    }
  };

// SMART CONTRACT PIECE
    Canvas.prototype.rentPixels = function (renter, pixels, newMeta) {
      // renter is msg.sender in Solidity, not actually required in argument
      // newMeta: { colors: [], link, comments}
      // Not including code for rental fees as part of MVP
      var allPixelsAvailable = true;
      for (var i = 0; i < pixels.length; i++) {
        // If any of the pixels are not "stale", break early and cancel rent
        if (pixels[i].cooldownTime > this.currentDay) {
          allPixelsAvailable = false;
          break;
        }
      }

      // send costs + transaction fees
      if (allPixelsAvailable) {
        this.changeMeta(pixels, newMeta);
        console.log(renter + " rented " + pixels.length + " pixels on day " + this.currentDay);
      }

    };

// SMART CONTRACT PIECE
  Canvas.prototype.transferOwnership = function (buyer, pixels, newMeta) {
    for (var i = 0; i < pixels.length; i++) {
      pixels[i].owner = buyer;
      this.changeMeta(pixels, newMeta)
      pixels[i].price = newMeta.price;
      pixels[i].cooldownTime = this.currentDay + 7;
    }
    console.log(buyer + " bought " + pixels.length + " pixels on day " + this.currentDay);
  };

// SMART CONTRACT PIECE
  Canvas.prototype.changeMeta = function (pixels, newMeta) {
    for (var i = 0; i < pixels.length; i++) {
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
