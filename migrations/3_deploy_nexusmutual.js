const Claims = artifacts.require('Claims');
const ClaimsData = artifacts.require('ClaimsDataMock');
const ClaimsReward = artifacts.require('ClaimsReward');
const NXMaster = artifacts.require('NXMasterMock');
const MCR = artifacts.require('MCR');
const NXMToken = artifacts.require('NXMToken');
const TokenData = artifacts.require('TokenDataMock');
const TokenFunctions = artifacts.require('TokenFunctionMock');
const TokenController = artifacts.require('TokenController');
const Pool1 = artifacts.require('Pool1Mock');
const Pool2 = artifacts.require('Pool2');
const PoolData = artifacts.require('PoolDataMock');
const Quotation = artifacts.require('Quotation');
const QuotationDataMock = artifacts.require('QuotationDataMock');
const GovernanceMock = artifacts.require('GovernanceMock');
const Governance = artifacts.require('Governance');
const ProposalCategory = artifacts.require('ProposalCategoryMock');
const MemberRoles = artifacts.require('MemberRoles');
const FactoryMock = artifacts.require('FactoryMock');
const DSValue = artifacts.require('NXMDSValueMock');
const DAI = artifacts.require('MockDAI');
const PooledStaking = artifacts.require('PooledStakingMock');
const INITIAL_SUPPLY = '1500000000000000000000000';
const QE = '0x51042c4d8936a7764d18370a6a0762b860bb8e07';

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    console.log('Migrations: nexusmutual contracts deployment started');

    let founderAddress = accounts[0];
    let factory = await FactoryMock.deployed();
    let dsv = await DSValue.deployed();
    let cad = await DAI.deployed();
    await deployer.deploy(Claims);
    await deployer.deploy(ClaimsData);
    await deployer.deploy(ClaimsReward);
    await deployer.deploy(Pool1);
    await deployer.deploy(Pool2, factory.address);
    await deployer.deploy(PoolData, founderAddress, dsv.address, cad.address);
    await deployer.deploy(MCR);
    const tc = await deployer.deploy(TokenController);
    const tk = await deployer.deploy(NXMToken, founderAddress, INITIAL_SUPPLY);
    await deployer.deploy(TokenData, founderAddress);
    await deployer.deploy(TokenFunctions);
    await deployer.deploy(Quotation);
    await deployer.deploy(QuotationDataMock, QE, founderAddress);
    await deployer.deploy(Governance);
    await deployer.deploy(GovernanceMock);
    await deployer.deploy(ProposalCategory);
    await deployer.deploy(MemberRoles);
    await deployer.deploy(NXMaster);
    await deployer.deploy(PooledStaking);

    console.log('Migrations: nexusmutual contracts deployment finished');
  });
};
