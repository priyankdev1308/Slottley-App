const envTypes = {
  uat: 'uat',
  prod: 'prod',
  dev: 'dev',
};

const environments = {
  [envTypes.dev]: {
    base_url: 'http://codonnier.tech/dipak/NextLevelHub/api/Service.php',
  },
  [envTypes.uat]: {
    base_url: 'http://codonnier.tech/dipak/NextLevelHub/api/Service.php',
  },
  [envTypes.prod]: {
    base_url: 'http://codonnier.tech/dipak/NextLevelHub/api/Service.php',
  },
};

export const getEnvVars = () => {
  const env = envTypes.prod;
  return environments[env];
};
