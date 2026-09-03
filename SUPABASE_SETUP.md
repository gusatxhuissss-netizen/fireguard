# Ativação do Supabase

O FireGuard funciona no MVP com a autenticação, banco de dados e armazenamento provisionados no projeto. A aplicação também inclui o cliente `@supabase/supabase-js` em `client/src/lib/supabase.ts`, preparado para ativação quando houver um projeto Supabase real.

| Variável | Finalidade | Onde usar |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Cliente web e autenticação Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima do projeto | Cliente web e RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servidor para rotinas administrativas | Somente servidor; nunca expor no cliente |

Após fornecer as variáveis em um canal seguro, a ativação deve seguir três passos. Primeiro, configurar as tabelas equivalentes para `profiles`, `fire_incidents`, `reports`, `alerts`, `sensors` e `drones`, com RLS habilitado. Em seguida, migrar a autenticação de `Manus OAuth` para `supabase.auth`, preservando os papéis **Usuário**, **Monitor** e **Admin** no perfil. Por fim, transferir o armazenamento de fotos para um bucket privado, gravando a chave do objeto na denúncia e gerando URLs autorizadas no servidor.

> Enquanto essas variáveis não forem fornecidas, a camada Supabase permanece desativada de forma intencional. Não há chaves simuladas, expostas ou embutidas no repositório.
