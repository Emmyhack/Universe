import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import toast from 'react-hot-toast';

export const useContract = (contractName: string) => {
  const { getContract, executeTransaction } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract(contractName);

  const callContract = useCallback(async (
    method: string,
    params: any[] = [],
    options: { gasLimit?: number; value?: string } = {}
  ) => {
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract[method](...params, options);
      await executeTransaction(tx, `Executing ${method}...`);
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, contractName, executeTransaction]);

  const readContract = useCallback(async (
    method: string,
    params: any[] = []
  ) => {
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contract[method](...params);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Read operation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, contractName]);

  return {
    contract,
    callContract,
    readContract,
    loading,
    error,
  };
};