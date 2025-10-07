
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { CheckCircleIcon, XCircleIcon } from '../components/icons/Icons';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWalletTransactions().then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const handleWithdraw = () => {
    if (window.confirm('Tem certeza que deseja solicitar um saque?')) {
      console.log('Saque solicitado pelo usuário.');
      // Aqui viria a lógica para iniciar o processo de saque via API.
    }
  };

  const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isCredit = tx.type === 'deposito';
    const amountColor = isCredit ? 'text-green-400' : 'text-red-400';
    const title: {[key: string]: string} = {
        'deposito': 'Depósito Recebido',
        'saque': 'Solicitação de Saque',
        'entrada_desafio': 'Entrada em Desafio'
    };

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-700">
        <div>
          <p className="font-semibold">{title[tx.type]}</p>
          <p className="text-xs text-text-secondary">{tx.createdAt.toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="text-right">
            <p className={`font-bold text-lg ${amountColor}`}>
                {isCredit ? '+' : ''}R$ {(tx.amount / 100).toFixed(2)}
            </p>
            <div className="flex items-center justify-end text-xs text-text-secondary capitalize">
                {tx.status === 'concluido' && <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />}
                {tx.status === 'falhou' && <XCircleIcon className="w-4 h-4 mr-1 text-red-500" />}
                <span>{tx.status}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Minha Carteira</h1>

      <div className="bg-surface text-center p-6 rounded-lg shadow-lg">
        <p className="text-text-secondary text-sm">SALDO ATUAL</p>
        <p className="text-5xl font-extrabold text-primary my-2">R$ {(user?.saldo || 0) / 100}</p>
        <div className="flex space-x-4 mt-4 justify-center">
            <button className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-6 rounded-lg transition-colors">Adicionar Créditos</button>
            <button onClick={handleWithdraw} className="bg-accent hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Solicitar Saque</button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Transações</h2>
        <div className="bg-surface p-4 rounded-lg shadow-lg">
          {loading ? (
            <p className="text-center text-text-secondary py-4">Carregando histórico...</p>
          ) : (
            transactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;