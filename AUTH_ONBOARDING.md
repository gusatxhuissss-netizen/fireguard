# Fluxo de cadastro e onboarding

O FireGuard separa o **onboarding de primeiro acesso** da tela de entrada. A rota `/onboarding` apresenta as etapas de criação de conta e aciona a autenticação configurada no projeto apenas quando a pessoa escolhe **Concluir cadastro e criar conta**.

| Etapa | Comportamento no MVP |
|---|---|
| Primeiro acesso | O provedor de autenticação valida a identidade e o servidor cria ou atualiza o perfil local. |
| Papel inicial | Todo novo perfil recebe o papel **Usuário**. |
| Perfil | Após autenticar, o usuário pode editar seu nome em `/profile`. |
| Elevação de papel | Um **Admin** pode promover o perfil para **Monitor** ou **Admin** no painel administrativo. |

> Na ativação futura do Supabase, esta mesma experiência deverá trocar a sessão atual por `supabase.auth` e aplicar o papel inicial em `profiles` por meio de uma política de RLS ou de uma função de servidor.
