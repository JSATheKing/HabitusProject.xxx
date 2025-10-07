import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlan } from '../types';
import { getPatentInfo } from '../utils/patents';
import { 
    LogoutIcon, CheckCircleIcon, SettingsIcon, PencilIcon, 
    BellIcon, KeyIcon, GlobeIcon, MoonIcon, MemberIcon,
    GoldPlanIcon, DiamondPlanIcon
} from '../components/icons/Icons';
import AvatarModal from '../components/AvatarModal';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  
  // State for editable fields
  const [nickname, setNickname] = useState('@alexfit');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('(11) 99999-8888');

  // State for UI components
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(`https://i.pravatar.cc/150?u=${user?.id}`);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activePlan, setActivePlan] = useState<UserPlan>(user?.plan || UserPlan.GRATUITO);

  // State for settings
  const [notifications, setNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const patentInfo = useMemo(() => getPatentInfo(user?.xp || 0), [user?.xp]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleAvatarSave = (newAvatarDataUrl: string) => {
    setAvatarUrl(newAvatarDataUrl);
    setIsAvatarModalOpen(false);
    showToast('Sua foto de perfil foi atualizada com sucesso!', 'success');
  };

  const handleSaveChanges = () => {
    showToast('Suas informações foram atualizadas com sucesso!', 'success');
  };
  
  const handleUpgrade = (plan: UserPlan) => {
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    if (window.confirm(`💎 Deseja migrar para o Plano ${planName}?`)) {
      setActivePlan(plan);
      showToast(`🎉 Parabéns! Agora você é um membro ${planName}!`, 'success');
      // API call to update plan would go here
    }
  };
  
  const PlanCard: React.FC<{
    plan: UserPlan,
    icon: React.FC<any>,
    title: string,
    fee: string,
    price: string,
    benefits?: string[],
    styles: { bg: string, border: string, button: string, buttonText: string, iconColor: string }
  }> = ({ plan, icon: Icon, title, fee, price, benefits, styles }) => {
    const isActive = activePlan === plan;
    return (
      <div className={`relative p-5 rounded-2xl border-2 transition-transform duration-300 hover:scale-[1.03] ${isActive ? styles.border : 'border-gray-700'} ${styles.bg}`}>
        {isActive && (
          <div className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-300 border border-green-400/50">Ativo</div>
        )}
        <div className="flex items-center mb-3">
          <Icon className={`w-8 h-8 mr-3 ${styles.iconColor}`} />
          <div>
            <h4 className="text-xl font-bold">{title}</h4>
            <p className="text-sm">{fee}</p>
          </div>
        </div>
        <p className="text-lg font-semibold my-4">{price}</p>
        
        {benefits && (
          <ul className="text-xs space-y-1.5 text-text-secondary mb-4">
            {benefits.map((benefit, i) => <li key={i} className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-accent flex-shrink-0" /> {benefit}</li>)}
          </ul>
        )}
        
        {!isActive && (
          <button onClick={() => handleUpgrade(plan)} className={`w-full font-bold py-2.5 rounded-lg transition-shadow ${styles.button}`}>
             {plan === UserPlan.GOLD ? '💎 Fazer Upgrade' : '⭐ Upgrade'}
          </button>
        )}
      </div>
    );
  };


  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-fade-in-up`}>
          {toast.message}
        </div>
      )}

      {/* Avatar Edit Modal */}
      <AvatarModal 
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleAvatarSave}
        currentAvatar={avatarUrl}
      />

      <div className="space-y-8 animate-fade-in-up pb-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="w-6 h-6"></div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <button className="text-text-secondary hover:text-white">
            <SettingsIcon className="w-6 h-6" />
          </button>
        </header>
        
        {/* User Section */}
        <section className="flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary animate-pulse-glow">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full border-4 border-bg-end object-cover"/>
            </div>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-1 right-1 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-opacity opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Alterar foto de perfil"
            >
              <PencilIcon className="w-5 h-5"/>
            </button>
          </div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <div className="mt-2 flex items-center justify-center space-x-3">
            <span className="flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-green-900/50 text-green-300 border border-green-500/50">
              <CheckCircleIcon className="w-4 h-4 mr-1"/> Verificado
            </span>
            <span className="flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/50">
              🟢 Aprovado
            </span>
          </div>
        </section>

        {/* Personal Info */}
        <section className="bg-glass border border-white/10 p-4 rounded-2xl">
          <h3 className="font-bold mb-4 text-lg">Minhas Informações Pessoais</h3>
          <div className="space-y-3 text-left">
            <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Estado" className="w-full bg-white/5 p-3 rounded-md text-sm" defaultValue="São Paulo"/>
                <input type="text" placeholder="Cidade" className="w-full bg-white/5 p-3 rounded-md text-sm" defaultValue="São Paulo"/>
            </div>
            <input type="text" placeholder="Data de Nascimento" className="w-full bg-white/5 p-3 rounded-md text-sm" defaultValue="01/01/1990"/>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Número de telefone" className="w-full bg-white/5 p-3 rounded-md text-sm"/>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-white/5 p-3 rounded-md text-sm"/>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Apelido público" className="w-full bg-white/5 p-3 rounded-md text-sm"/>
          </div>
          <button onClick={handleSaveChanges} className="mt-4 w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-glow-blue/40 transition-shadow">
              Salvar Alterações
          </button>
        </section>

        {/* Performance */}
        <section>
          <h3 className="font-bold mb-2 text-lg">Meu Desempenho</h3>
          <div className="bg-gradient-container p-4 rounded-xl shadow-glow-dual flex items-center space-x-4">
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <patentInfo.currentPatent.Icon className="w-full h-full" />
              </div>
              <div className="flex-grow space-y-1">
                  <h2 className="text-lg font-black text-gradient-purple-blue">
                    {patentInfo.currentPatent.name}
                  </h2>
                  <p className="font-bold text-secondary">
                    {(user?.xp || 0).toLocaleString('pt-BR')} XP
                  </p>
                  <div className="h-2 w-full bg-[#23233A] rounded-full overflow-hidden">
                      <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          style={{ width: `${patentInfo.progressPercentage}%` }}
                      ></div>
                  </div>
              </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section>
          <h3 className="font-bold mb-4 text-lg">Planos de Assinatura</h3>
          <div className="space-y-6">
            <PlanCard
              plan={UserPlan.GRATUITO}
              icon={MemberIcon}
              title="Plano Member"
              fee="Taxa de saque: 15%"
              price="R$ 0,00 / mês"
              styles={{
                bg: 'bg-gradient-to-br from-[#1C1C24] to-[#2A2A36]',
                border: 'border-gray-500',
                button: '',
                buttonText: '',
                iconColor: 'text-gray-400',
              }}
            />
             <PlanCard
              plan={UserPlan.GOLD}
              icon={GoldPlanIcon}
              title="Plano Gold"
              fee="Taxa de saque: 10%"
              price="R$ 49,90 / mês"
              styles={{
                bg: 'bg-gradient-to-br from-[#2D2300] to-[#4E3B00]',
                border: 'border-yellow-400 shadow-lg shadow-yellow-400/20',
                button: 'bg-gradient-to-r from-yellow-500 to-amber-400 text-black',
                buttonText: 'text-black',
                iconColor: 'text-yellow-400',
              }}
            />
            <div className="p-0.5 rounded-2xl bg-gradient-to-r from-secondary to-primary bg-[length:200%_auto] animate-gradient-move">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#3B0CA3] rounded-[15px]">
                     <PlanCard
                      plan={UserPlan.DIAMOND}
                      icon={DiamondPlanIcon}
                      title="Plano Diamond"
                      fee="Taxa de saque: 5%"
                      price="R$ 99,90 / mês"
                      benefits={[
                        "Acesso antecipado a novos desafios",
                        "Taxa de saque mínima (5%)",
                        "Badge exclusiva Diamond no perfil",
                        "Suporte prioritário"
                      ]}
                      styles={{
                        bg: 'bg-transparent',
                        border: 'border-transparent',
                        button: 'bg-gradient-to-r from-secondary to-primary text-white hover:shadow-glow-blue/50',
                        buttonText: 'text-white',
                        iconColor: 'text-secondary',
                      }}
                    />
                </div>
            </div>
          </div>
        </section>

        {/* Advanced Settings */}
        <section className="bg-glass border border-white/10 p-2 rounded-2xl">
            <h3 className="font-bold text-lg px-2 pt-2">Configurações Avançadas</h3>
            <div className="divide-y divide-white/10">
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center"><BellIcon className="w-5 h-5 mr-3 text-text-secondary"/><span>Notificações</span></div>
                <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-primary' : 'bg-gray-600'}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center"><MoonIcon className="w-5 h-5 mr-3 text-text-secondary"/><span>Modo Escuro</span></div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-600'}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}/>
                </button>
              </div>
              <a href="#" className="flex justify-between items-center p-3 rounded-b-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center"><KeyIcon className="w-5 h-5 mr-3 text-text-secondary"/><span>Alterar Senha</span></div>
              </a>
            </div>
        </section>

        {/* Logout */}
        <section>
          <button onClick={logout} className="w-full flex items-center justify-center py-3 text-danger hover:bg-danger/10 rounded-lg transition-colors">
              <LogoutIcon className="w-5 h-5 mr-2"/>
              <span className="font-semibold">Sair da conta</span>
          </button>
        </section>
      </div>
    </>
  );
};

export default Profile;