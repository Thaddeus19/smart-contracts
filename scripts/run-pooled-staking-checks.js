const { hex } = require('../test/utils/helpers');
const { setupLoader } = require('@openzeppelin/contract-loader');
const Web3 = require('web3');
const fs = require('fs');

const STAKER_MIGRATION_COMPLETED_EVENT = 'StakersMigrationCompleted';
const MIGRATED_MEMBER_EVENT = 'MigratedMember';
const MASTER_ADDRESS = '0x01bfd82675dbcc7762c84019ca518e701c0cd07e';
const GWEI_IN_WEI = 10e9;


const providerURL = 'https://mainnet.infura.io/v3/8c4d7fcf0426485db01dd6f4626c81a2';
//const providerURL = 'https://parity.nexusmutual.io';


const BN = Web3.utils.BN;

function chunk (arr, chunkSize) {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}



async function getStakerContractStakes(pooledStaking, member) {
  const contracts = await pooledStaking.stakerContractsArray(member);
  for (let contract of contracts) {
    const contractStake = (await pooledStaking.stakerContractStake(member, contract)).toString();
    console.log({
      member,
      contract,
      contractStake
    });
  }
}

async function main() {


  const web3 = new Web3(providerURL);
  const loader = setupLoader({
    provider: web3.currentProvider,
    defaultGas: 12e8, // 1 million
    defaultGasPrice: 6e9, // 5 gwei
  }).truffle;


  console.log(`Loading master at ${MASTER_ADDRESS}..`)
  const master = loader.fromArtifact('MasterMock', MASTER_ADDRESS);


  // console.log(`Expected PS: ${await master.getLatestAddress(hex('PS'))}`);
  // const tfAddress = await master.getLatestAddress(hex('TF'));
  //
  // console.log('TF:');
  // console.log(await web3.eth.getStorageAt(tfAddress, 10));
  // console.log(await web3.eth.getStorageAt(tfAddress, 11));
  //
  // console.log('CR:');
  // const crAddress = await master.getLatestAddress(hex('CR'));
  // console.log(await web3.eth.getStorageAt(crAddress, 12));
  // console.log(await web3.eth.getStorageAt(crAddress, 13));
  //
  // const tc = loader.fromArtifact('TokenController', await master.getLatestAddress(hex('TC')));
  // console.log(`TokenController.pooledStaking = ${await tc.pooledStaking()}`);

  const roxana = '0x144aAD1020cbBFD2441443721057e1eC0577a639';

  const hugh = '0x87b2a7559d85f4653f13e6546a14189cd5455d45';

  const tcAddress = await master.getLatestAddress(hex('TC'));
  console.log(`tcAddress ${tcAddress}`);
  const tokenController = loader.fromArtifact('TokenController', tcAddress);

  const mrAddress = await master.getLatestAddress(hex('MR'));
  const mr = loader.fromArtifact('MemberRoles', mrAddress);

  const tokenFunctions = loader.fromArtifact('TokenFunctions', await master.getLatestAddress(hex('TF')));

  const psAddress = await master.getLatestAddress(hex('PS'));
  console.log(`Loading PooledStaking at ${psAddress}..`)
  const pooledStaking = loader.fromArtifact('PooledStaking', psAddress);

  console.log(`HUGH:`);
  await getStakerContractStakes(pooledStaking, hugh);
  console.log(`==========================================`);
  console.log(`ROXANA:`);
  await getStakerContractStakes(pooledStaking, roxana);

  console.log(`pooledStaking.master ${await pooledStaking.master()}`);
  console.log(`pooledStaking.tokenController ${await pooledStaking.tokenController()}`);
  console.log(`pooledStaking.token ${await pooledStaking.token()}`);

  const now = new Date().getTime();

  console.log(await tokenController.pooledStaking());
  console.log(await tokenController.minCALockTime());
  console.log(await tokenController.token());



  const nxmToken = loader.fromArtifact('NXMToken', await master.dAppToken());

  const psBalance = await nxmToken.balanceOf(pooledStaking.address);
  console.log(`psBalance ${psBalance}`);

  // const mr = loader.fromArtifact('MemberRoles', await master.getLatestAddress(hex('MR')));
  const mrWeb3 = new web3.eth.Contract(require('../build/contracts/MemberRoles').abi, await master.getLatestAddress(hex('MR')));
  //const { memberArray: members }  = await mrWeb3.methods.members('2').call();
  const members = fs.readFileSync('./members.txt', 'utf8').split(',').map(a => a.trim());
  console.log(`members: ${members.length}`);

  const deposits = {};
  const chunks = chunk(members, 50);
  let batchCount = 0;
  for (let chunk of chunks) {
    console.log(`Fetching batch ${batchCount++}..`);
    await Promise.all(chunk.map(async (member) => {
      deposits[member] = await pooledStaking.stakerDeposit(member);
    }));
  }
  console.log(`Finished fetching deposits.`);

  let sum = new BN('0');
  for (const deposit of Object.values(deposits)) {
    sum = sum.add(deposit);
  }
  console.log(`SUM: ${sum.toString()}`);
}

main().catch(e => {
  console.error(`FATAL: `, e);
})
