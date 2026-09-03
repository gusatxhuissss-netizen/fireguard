# Visualização territorial do MVP

O componente de mapas externo foi testado no ambiente de desenvolvimento, mas o carregamento do script remoto retornou falha de rede. Para evitar uma área indisponível na experiência, o FireGuard utiliza temporariamente uma **visualização territorial interativa própria** em `client/src/components/RiskMap.tsx`.

Ela mantém os comportamentos essenciais para o MVP: os marcadores de focos e denúncias respondem aos filtros de risco **Baixo**, **Médio**, **Alto** e **Crítico**; os pontos podem ser selecionados; e o cartão contextual apresenta tipo, origem e criticidade. As posições são calculadas a partir das coordenadas persistidas das ocorrências.

> A substituição por um provedor cartográfico real fica isolada ao componente `RiskMap.tsx`. Quando o serviço de mapas estiver disponível, ele poderá consumir as mesmas entidades `fireIncidents` e `reports`, sem alterar os demais fluxos operacionais.
