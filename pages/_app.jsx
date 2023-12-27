import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../abi/assessment.json";
import "./index.css"

const App = () => {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  const contractAddress = "0x30298cb1Da58Ee04a5f67ca17085256595C0C008";
  const atmABI = atm_abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  }

  const balanceOfUser = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
      setWithdrawLoading(false);
      setDepositLoading(false);
    }
  }

  const deposit = async () => {
    if (atm) {
      setDepositLoading(true);
      try {
        let tx = await atm.deposit(1);
        await tx.wait()
        balanceOfUser();

      } catch (error) {
        setDepositLoading(false);
      }
    }
  }

  const withdraw = async () => {
    if (atm) {
      setWithdrawLoading(true);
      try {
        let tx = await atm.withdraw(1);
        await tx.wait()
        balanceOfUser();

      } catch (error) {
        setWithdrawLoading(false);
      }
    }
  }

  useEffect(() => { getWallet(); }, []);


  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button style={{ backgroundColor: "purple", padding: "10px", color: "white", border: "none", borderRadius: "5px", textAlign: "center" }} onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined && account != undefined) {
      balanceOfUser();
    }

    return (
      <div style={{ fontFamily: "sans-serif" }}>
        <div className="navbar bg-base-100 header">
          <a className="btn btn-ghost text-xl" style={{ fontSize: "20px" }}>myWallet</a>
          <p className="text-red-500">Your Account: {account}</p>
        </div>
        <div style={{ margin: "auto" }}>
          <p className="balance" style={{ display: "block", textAlign: "center", fontSize: "25px" }}>Your Balance: {balance}</p>
          <div className="" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button disabled={depositLoading || withdrawLoading} style={{ backgroundColor: "purple", padding: "15px", color: "white", border: "none", borderRadius: "5px" }} onClick={deposit}>{depositLoading ? "Processing" : "Deposit 1 ETH"}</button>
            <button disabled={withdrawLoading || depositLoading} style={{ backgroundColor: "purple", padding: "15px", color: "white", border: "none", borderRadius: "5px" }} onClick={withdraw}>{withdrawLoading ? "Processing" : "Withdraw 1 ETH"}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main>
      {initUser()}
    </main>
  )


}

export default App