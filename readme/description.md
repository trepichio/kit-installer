# Este repositório

## Descrição
Este é o repositório do Installer, responsável em executar instruções para instalar o sistema conforme os dados contidos no job recebido e armazenado.

## Arquitetura
![https://raw.githubusercontent.com/trepichio/kit-installer/master/Kit-Builder-Architecture.png](https://raw.githubusercontent.com/trepichio/kit-installer/master/Kit-Builder-Architecture.png)

Veja também o repositório das outras partes desta arquitetura:

- [Frontend](https://github.com/trepichio/kit-builder-frontend-vue)
- [Kit-Builder](https://github.com/trepichio/kit-builder-app)

## Detalhes
Foi feito em arquitetura semelhante a microserviços:
### VueJS (Frontend) - NETLIFY
- coleta parâmetros
- POST na API com params
- GET link/id/alerta

O Frontend foi feito em *VueJS*, com *Vuetify*. O formulário possui validações customizadas para IP, hostname, versão dos aplicativos e do banco de dados. Possui também busca de endereço pelo CEP e dos dados de clientes por uma API de base de dados (mockado).
Faz envio das informações para uma API (serveless) *NodeJS/Express* hospedada no *Netlify*.

### NodeJS + Express API + NETLIFY
- recebe params e add job na queue do Firebase
 - não aceita request já existentes na queue ou done
- retorna link/id/alerta (ao front)
- retorna lista dos jobs em andamento

Esta API recebe os dados do frontend, e executa *Funções Lambda do Netlify*

### Firebase Job Queue (Realtime Database)
- Armazena parâmetros para o kit
- Armazena metadados: data de criação, queue e status do Job
- Armazena a URL gerada e enviada para baixar o Kit
- Armazena o histórico

### VM WINDOWS (BUILDER)
- ambiente preparado com Firebird 2.5
- DLLs instaladas e registradas
- node script iniciado, reiniciado, gerenciado e monitorado com PM2
 - recebe lista de jobs do Firebase e seta queue (quando starta)
 - watch Firebase changes e add job na queue
   - watch jobs done, remove da queue e manda e-mail de notificação com URL para baixar o arquivo
   - watch jobs failed e notifica erros por e-mail  ao administrador e solicitante
 - seta status do job no firebase enquanro executa o empacotamento do instalador com o node-pkg, produzindo um executável (.EXE)
 - seta status done  do job no firebase com URL do executável e remove job da queue

Utiliza *Node-pkg* para empacotar o projeto Node em um arquivo executável, o qual é responsável em efetuar a instalação do Kit (programas vendidos pela empresa) em máquinas Servidor e Terminal.
