const web3 = require('web3');
require('dotenv').config()

const web3js = new web3(new web3.providers.HttpProvider(process.env.PROVIDER));
const contractABI = require('./contractAbi.json');
const contract = new web3js.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS, { from: process.env.OWNER_ADDRESS });
web3js.eth.handleRevert = true; // handle require reason return from contract
const dateNow = Date.now();

const gasPrice = async () => {
	const response = await web3js.eth.getGasPrice();
	console.log(response);
	return response;
}

const calculateEstimateGas = async (encodeFunc) => {
	const tx = {
		from: process.env.OWNER_ADDRESS,
		to: process.env.CONTRACT_ADDRESS,
		data: await encodeFunc
	}
	const response = await web3js.eth.estimateGas(tx);
	console.log(response);
	return response;
}

const getListingTime = async () => {
    const listTime = await contract.methods.exchangeListingTime().call().then(x => x);
    console.log('Exchange Listing Time : ', listTime);
};

const getAllGroups = async () => {
    const getData = await contract.methods.getAllGroups().call();
    console.table(getData);
	return getData;
}

const getGroupCount = async () => {
    const getData = await contract.methods.groupCount().call();
    console.log('Group Count : ', getData);
	return getData;
}

const getGroup = async (_groupId) => {
    const getData = await contract.methods.tokenGroup(_groupId).call().then(x => x);
    if(getData[0] != ""){
        console.table(getData);
		return getData;
    }
}

const encodeFunc =  contract.methods.addGroup("test1",false,"1","2",dateNow,"10").encodeABI();
//const encodeFunc =  contract.methods.removeGroup(15).encodeABI();
//const encodeFunc =  contract.methods.setExchangeListTime(dateNow).encodeABI();
//const encodeFunc =  contract.methods.withdraw("0x9319273E13735127CfAe844Ebeb4322Bd311a27c",1).encodeABI();

contractInteraction = async (encodeFunc) => {

	const tx = {
		to: process.env.CONTRACT_ADDRESS,
		data: await encodeFunc,
		gas: await calculateEstimateGas(encodeFunc),
		gasPrice: await gasPrice()
	}

	web3js.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY).then(signed => {
		web3js.eth.sendSignedTransaction(signed.rawTransaction)
		.on('transactionHash', function(hash){
			console.log('hash : ',hash);
		})
		.on('receipt', function(receipt){
			console.log('receipt : ',receipt.status);
		})
		.on('confirmation', function(confirmationNumber, receipt){ 
			console.log('confirmation : ',confirmationNumber);
			console.log('confirmation receipt : ',receipt.status);
		})
		.on('error', function(error){ 
			if(error.reason) {
				console.log('error : ',error.reason);
			}else{
				console.log('error : ',error);
			}
		});
	});
}

//contractInteraction(encodeFunc);
