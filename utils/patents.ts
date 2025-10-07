import { HelmetIcon, SwordsIcon, ShieldIcon, ArmIcon, MedalIcon, EagleIcon, StarIcon, CrownIcon, TrophyV2Icon, TridentIcon, PresidentIcon } from '../components/icons/Icons';

export const patentTiers = [
  { name: 'Conscrito da Disciplina', minXp: 0, maxXp: 100, Icon: HelmetIcon },
  { name: 'Soldado da Disciplina', minXp: 101, maxXp: 250, Icon: SwordsIcon },
  { name: 'Cabo da Disciplina', minXp: 251, maxXp: 350, Icon: ShieldIcon },
  { name: 'Sargento da Disciplina', minXp: 351, maxXp: 500, Icon: ArmIcon },
  { name: 'Tenente da Disciplina', minXp: 501, maxXp: 650, Icon: MedalIcon },
  { name: 'Capitão da Disciplina', minXp: 651, maxXp: 800, Icon: EagleIcon },
  { name: 'Major da Disciplina', minXp: 801, maxXp: 1000, Icon: StarIcon },
  { name: 'Tenente Coronel', minXp: 1001, maxXp: 1300, Icon: CrownIcon },
  { name: 'Coronel da Disciplina', minXp: 1301, maxXp: 1500, Icon: TrophyV2Icon },
  { name: 'General da Disciplina', minXp: 1501, maxXp: 2000, Icon: TridentIcon },
  { name: 'Presidente da Disciplina', minXp: 2001, maxXp: Infinity, Icon: PresidentIcon },
];

export const getPatentInfo = (xp: number) => {
  const currentTierIndex = patentTiers.findIndex(tier => xp >= tier.minXp && xp <= tier.maxXp);
  const currentPatent = patentTiers[currentTierIndex] || patentTiers[0];
  const nextPatent = patentTiers[currentTierIndex + 1];

  let progressPercentage = 0;
  let xpToNext = 0;

  if (nextPatent && currentPatent.maxXp !== Infinity) {
    const tierXpRange = currentPatent.maxXp - currentPatent.minXp;
    if (tierXpRange > 0) {
        const userProgressInTier = xp - currentPatent.minXp;
        progressPercentage = (userProgressInTier / tierXpRange) * 100;
    }
    xpToNext = currentPatent.maxXp + 1 - xp;
  } else {
    // Max level
    progressPercentage = 100;
  }

  return {
    currentPatent,
    nextPatent,
    progressPercentage,
    xpToNext,
  };
};
