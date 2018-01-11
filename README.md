# CryptoCanvas

## Idea
See general write-up of the idea here: https://docs.google.com/document/d/1skDeYsgNJ-PnR4nK_N8SF5BPQ6K0NdqvOgpKbcuLb28/edit?usp=docs_home&ths=true

## Strategy
We already have general wireframes drawn up.
At the Hackathon we will primarily focus on creating a MVP Smart Contract that we can display in a web browser.
We will need to discuss the design more when we have a better idea of MVP.

## MVP
In this repo, I'm simulating (work in progress) a basic contract that I think has our Minimum Viable Product.
We will need to essentially translate this to Solidity and get it running on a local instance of the EVM.
For examples of what a contract

See this for a better idea of what a SmartContract looks like. We will reference this code a lot: https://medium.com/loom-network/how-to-code-your-own-cryptokitties-style-game-on-ethereum-7c8ac86a4eb3

# Not all of the functions here matter, the ones that are important are:

# Canvas (Contract)
The overall contract that contains all the functionality.

# StandardMethods
Methods like transferEther.

# Pixel (Struct)
The primary element of this contract - has features and can be bought and rented.

# init
Initializes the Canvas. For MVP, we will just assume that the whole board is created at once, and that ownership belongs to the ContractOwner (company). In final product, we will not be doing it this way, but closer to the way an ICO has different "Sale Stages", with aspects of auctioning.

# buyPixels
Users are able to buy pixels (if the owner has set a price). When you buy pixels, you set the new properties. One of these properties will be the "cooldownTime" or the time for the pixel to go "stale". There is a free default cooldownTime (see ownerOnly), but users can pay extra to extend their initial cooldownTime. At any point, the pixel owners can also pay to add time.

Stale pixels retain their properties until someone changes them through a buy or rent action.

# rentPixels
When a pixel goes "stale", aka it passes its cooldownTime, other users will be able to rent the pixel.

For MVP:
- Users are only able to rent a stale pixel when it has become stale. There is a default amount of time that they can rent it for (see ownerOnly), which resets the pixel's properties and updates the cooldownTime.

- At any time, the owner of that pixel can re-seize control of the pixel (revert the properties), but this won't take effect until the new cooldownTime has been reached

For Final Product:
- We may want to consider allowing users to "bid" on pixels before they become stale. This will allow us to introduce the idea of paying the pixel owners when lots of people want to rent their property.

# transferOwnership
Pixels will each have their own price (set by the purchaser during a buy action). If the price is set to null, the pixel is not for sale. Users can buy pixels (setting off transferOwnership) at any point. Owners can change the prices of their pixels at any point.

# ownerOnly
We will need a way to control various aspects of the contract, although not too much. Ethereum has a handy way of allowing the ContractOwner to execute private functions. This function will allow the company to reset things like the default (free) cooldownTime, rentalFees and buyingFees.
