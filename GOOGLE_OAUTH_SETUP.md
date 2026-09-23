# Google OAuth no FireGuard

O botão **Continuar com o Google** está visualmente pronto e, no ambiente atual, utiliza o fluxo OAuth já configurado pelo provedor Manus. Nenhuma credencial Google é armazenada no código.

Para ativar um provedor Google direto no futuro, configure as variáveis somente no ambiente do servidor:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

O `GOOGLE_REDIRECT_URI` deve apontar para o callback HTTPS publicado pela aplicação. Também será necessário cadastrar esse endereço no Google Cloud Console, habilitar o provedor OAuth e implementar a troca segura do código por sessão no backend. O segredo nunca deve ser prefixado com `VITE_` nem enviado ao frontend.

Enquanto essas variáveis não estiverem preenchidas e o provedor não estiver habilitado, o fluxo existente do Manus deve permanecer ativo. Não use valores de exemplo como credenciais reais e não commite arquivos `.env`.
