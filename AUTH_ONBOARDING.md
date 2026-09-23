# Autenticação e onboarding do FireGuard

O FireGuard separa a apresentação pública, a entrada e o cadastro. A landing page fica em `/`; o login em `/login`; o cadastro em `/register`; e a recuperação de senha em `/forgot-password`.

| Fluxo | Comportamento atual |
|---|---|
| Landing | Apresenta a proposta SaaS, funcionalidades, demonstração visual, planos e FAQ. |
| Cadastro local | Valida nome, empresa, e-mail, data de nascimento, telefone, senha e confirmação; armazena a senha com hash. |
| Primeiro acesso | O servidor cria o perfil local com o papel inicial **Usuário** e encaminha para o dashboard. |
| Login local | Valida e-mail e senha e encaminha para o dashboard. |
| Google | O botão visual está pronto e usa o fluxo OAuth configurado no ambiente atual. O retorno bem-sucedido vai para o dashboard. |
| Recuperação | A página `/forgot-password` possui estados de validação, processamento e sucesso. O envio real de e-mail permanece desativado até a configuração de um provedor. |
| Perfil | Após autenticar, o usuário pode editar seus dados em `/profile`. |
| Papéis | Um **Admin** pode promover perfis para **Monitor** ou **Admin** no painel administrativo. |

> Nenhuma credencial Google é inventada ou armazenada no frontend. Consulte `GOOGLE_OAUTH_SETUP.md` para ativar um provedor Google direto no futuro.

Na ativação futura do Supabase, esta mesma experiência poderá trocar a sessão atual por `supabase.auth` e aplicar o papel inicial em `profiles` por meio de uma política de RLS ou de uma função de servidor.
