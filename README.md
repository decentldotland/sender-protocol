Introduction
============

[1notif](https://1notif.net) is an OOTB (Out-Of-The-Box), gasless and immediate notification protocol. Due to the used Tech-Stack and the infrastructure architecture created by 1notif, the protocol provides OOTB support to any EVM blockchain.

Tech-Stack
==========

- [Execution Machine (EXM)](https://exm.dev)
- DecentLand
	- [ARK Protocol](https://ark.decent.land)
	- [molecule.sh](https://molecule.sh)

Simplified Architecture Overview
================================

- Input Layer: web2 or web3 events (server, frontend, smart contract)
- Execution Layer: 
	- **low-level**: 1notif channels (permission-less functions, smart contracts) deployed on EXM.
	- **intermediate-level**: Storage - Arweave
	- **high-level**: 1notif SDK
- Output Layer: client-side (integrated channels across D/Apps)

1notif Smart Contracts
======================
## EXM Briefly:
1notif protocol is composed of a set of smart contracts deployed on the EXM protocol. Briefly, EXM smart contracts are serverless and the final states are lazy evaluated (Lazy Evaluation), the contract state is cashed on centralized servers (EXM side with Verifiable Computing) that provide the instant finality & evaluation features of EXM protocol. [Read more about how EXM works here.](https://communitylabs.medium.com/execution-machine-explained-b6ca32d884d1)

![](https://miro.medium.com/max/828/1*f4VCJAxmJgw87ZI2ClYsRw.webp)

## 1notif Smart Contracts Architecture

### Channels Registry Contract (CRC):
[1notif resolver](https://github.com/1notif/1notif-resolver) (CRC) is a simple name system resolver for the serverless functions deployed on EXM. We plan to use 1notif resolver to create a naming system dedicated to 1notif protocol channels. 

### Channels
1notif channels are smart contracts deployed by Dapps developer via 1notif SDK (soon) to push notifications to a channel's `subscribers` in a gasless, immediate and onchain manner.

#### 1) x-EVM Channel
This `channel` template provides OOTB support for pushing notifications from Dapp's backends to any channel's subscriber EOA EVM address regardless of the EVM chain. check the [source-code](./contracts/source-codes/evm-channel.js) | [state](./contracts/states/evm-channel.json)

#### 2) [Arweave](https://arweave.org) Channel
Arweave `channel` smart contract is a special template for the Dapps built on the Arweave blockchain. check the [source-code](./contracts/source-codes/arweave-channel.js) | [state](./contracts/states/arweave-channel.json)

#### 3) [Solana](https://solana.com/) Channel
Solana channel smart contract is a template dedicated for Solana notification pushing. check the [source-code](./contracts/source-codes/sol-channel.js) | [state](./contracts/states/sol-channel.json)

#### 4) [Zilliqa](https://www.zilliqa.com/) Channel
Zilliqa channel smart contract is a template dedicated for Zillqa notification pushing. check the [source-code](./contracts/source-codes/zil-channel.js) | [state](./contracts/states/zil-channel.json)

#### 5) [Tron](https://tron.network/) Channel 
Tron channel smart contract is a template dedicated for Tron notification pushing. check the [source-code](./contracts/source-codes/trx-channel.js) | [state](./contracts/states/trx-channel.json)

#### 6) [Stacks](https://stacks.co/) Channel 
Stacks channel smart contract is a template dedicated for Stacks notification pushing. check the [source-code](./contracts/source-codes/stacks-channel.js) | [state](./contracts/states/stacks-channel.json)


Follow Us
=========
- [Twitter](https://twitter.com/1notif)

Licensing
=========
All of 1notif open-sourced codes go under the GPL-3.0 license. [Read the license](./LICENSE)
