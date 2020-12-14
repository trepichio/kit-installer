<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️--><h1 align="center">installer</h1>
<p align="center">
		<a href="https://david-dm.org/trepichio/kit-installer"><img alt="Dependencies" src="https://img.shields.io/david/trepichio/kit-installer.svg" height="20"/></a>
<a href="https://github.com/trepichio/kit-installer/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/trepichio/kit-installer.svg" height="20"/></a>
<a href="#"><img alt="Not maintained" src="https://img.shields.io/badge/maintained%3F-No-red" height="20"/></a>
	</p>

<p align="center">
  <b>installer for MBD Kits</b></br>
  <sub>Gerador de instalações customizadas para clientes (a.k.a. Kits). Desenvolvido por minha iniciativa própria para uso interno da empresa, afim de agilizar o processo e a qualidade do pós-atendimento do suporte automatizando e padronizando as implementações. Apesar de funcional, não está com sua arquitetura completa planejada, e seu desenvolvimento foi descontinuado.<sub>
</p>

<br />

[![DEMONSTRAÇÃO DO KIT BUILDER](https://img.youtube.com/vi/bYxRP1SDdaw/mqdefault.jpg)](https://www.youtube.com/watch?v=bYxRP1SDdaw)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#table-of-contents)

## ➤ Table of Contents

* [➤ Este repositório](#-este-repositrio)
	* [➤ Descrição](#-descrio)
	* [➤ Arquitetura](#-arquitetura)
	* [➤ Detalhes](#-detalhes)
		* [VueJS (Frontend) - NETLIFY](#vuejs-frontend---netlify)
		* [NodeJS + Express API + NETLIFY](#nodejs--express-api--netlify)
		* [Firebase Job Queue (Realtime Database)](#firebase-job-queue-realtime-database)
		* [VM WINDOWS (BUILDER)](#vm-windows-builder)
	* [➤ Contributors](#-contributors)
	* [➤ License](#-license)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#este-repositrio)

# ➤ Este repositório


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#descrio)

## ➤ Descrição
Este é o repositório do Installer, responsável em executar instruções para instalar o sistema conforme os dados contidos no job recebido e armazenado.


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#arquitetura)

## ➤ Arquitetura
![https://raw.githubusercontent.com/trepichio/kit-installer/master/Kit-Builder-Architecture.png](https://raw.githubusercontent.com/trepichio/kit-installer/master/Kit-Builder-Architecture.png)

Veja também o repositório das outras partes desta arquitetura:

- [Frontend](https://github.com/trepichio/kit-builder-frontend-vue)
- [Kit-Builder](https://github.com/trepichio/kit-builder-app)


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#detalhes)

## ➤ Detalhes
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


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#contributors)

## ➤ Contributors
	

| [<img alt="João Trepichio" src="https://avatars2.githubusercontent.com/u/11396817?s=460&u=085712d4f1296e6ad0a220ae7c0ea5278a9c40ed&v=4" width="100">](https://trepichio.github.io) |
|:--------------------------------------------------:|
| [João Trepichio](https://trepichio.github.io)    |


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#license)

## ➤ License
	
Licensed under [ISC](https://opensource.org/licenses/ISC).