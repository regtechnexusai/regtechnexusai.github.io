(() => {
  'use strict';
  const root = document.getElementById('regulatory-coverage-workbench');
  if (!root) return;
  const countryNames = "Global standards and cross-border frameworks|Bangladesh|United States|United Kingdom|European Union (EU-level)|China|India|Singapore|Hong Kong|Japan|South Korea|Australia|Canada|Brazil|United Arab Emirates (federal)|DIFC / DFSA (UAE)|ADGM / FSRA (UAE)|Saudi Arabia|Malaysia|Indonesia|Thailand|Philippines|Vietnam|Pakistan|Sri Lanka|Nepal|New Zealand|Switzerland|Norway|Liechtenstein|Türkiye|Bahrain|Qatar|Kuwait|Oman|Jordan|Israel|South Africa|Nigeria|Kenya|Ghana|Rwanda|Egypt|Morocco|Mauritius|Tanzania|Uganda|Ethiopia|Senegal / WAEMU|CEMAC regional framework|Mexico|Chile|Colombia|Argentina|Peru|The Bahamas|Barbados|Jamaica|Bermuda|Kazakhstan|Uzbekistan|Brunei Darussalam|Cambodia|Laos|Taiwan|Mongolia|Fiji|Papua New Guinea|Angola|Botswana|Burundi|Eswatini|Gabon|The Gambia|Liberia|Malawi|Mali|Mozambique|Niger|Algeria|Tunisia|Côte d’Ivoire|Burkina Faso|Benin|Togo|Guinea|Democratic Republic of the Congo|Zambia|Zimbabwe|Namibia|Lesotho|Seychelles|Cape Verde|France|Germany|Italy|Spain|Netherlands|Ireland|Poland|Sweden|Denmark|Belgium|Austria|Portugal|Greece|Finland|Luxembourg|Malta|Iceland|Serbia|Georgia|Armenia|Azerbaijan|Bosnia and Herzegovina|Montenegro|Moldova|Belarus|Ukraine|Russia|Kosovo|North Macedonia|Albania|Kyrgyz Republic|Tajikistan|Costa Rica|Panama|El Salvador|Ecuador|Uruguay|Trinidad and Tobago|Eastern Caribbean Currency Union|Maldives|Afghanistan|Bhutan|Macau SAR|Samoa|Vanuatu|Solomon Islands|Tonga|Timor-Leste|Cayman Islands|British Virgin Islands|Bolivia|Guatemala|Honduras|Paraguay|Czechia|Hungary|Romania|Lebanon|South Sudan|Côte d’Ivoire / WAEMU regional record|Turkmenistan|Curaçao and Sint Maarten|Jersey|Guernsey|Isle of Man|Gibraltar|Estonia|Cyprus|Bulgaria|Iraq|Yemen|Syria|Haiti|Venezuela|Cook Islands|Macao, China|Marshall Islands|Nauru|Niue|Palau|Tuvalu|Chinese Taipei|Myanmar|Anguilla|Antigua and Barbuda|Aruba|Belize|Curaçao|Dominica|Grenada|Guyana|Montserrat|Saint Kitts and Nevis|Saint Lucia|Sint Maarten|Saint Vincent and the Grenadines|Suriname|Turks and Caicos Islands|Comoros|Guinea-Bissau|São Tomé and Príncipe|Sierra Leone|Eritrea|Madagascar|Cuba|Dominican Republic|Nicaragua|Djibouti|Sudan|Somalia|State of Palestine|Libya|Mauritania|Andorra|Croatia|Latvia|Lithuania|Monaco|San Marino|Slovakia|Slovenia|Holy See|Cameroon|Central African Republic|Republic of the Congo|Equatorial Guinea|Chad|Senegal".split('|');
  const sources = {
    'France': [
      ['Autorité de contrôle prudentiel et de résolution (ACPR)','Prudential supervision and insurance / banking oversight','https://acpr.banque-france.fr/en'],
      ['Autorité des marchés financiers (AMF)','Securities and financial markets','https://www.amf-france.org/en'],
      ['TRACFIN','Financial intelligence and AML/CFT','https://www.economie.gouv.fr/tracfin']
    ],
    'Germany': [
      ['Federal Financial Supervisory Authority (BaFin)','Banking, securities, insurance and financial supervision','https://www.bafin.de/EN/Home/home_node.html'],
      ['Deutsche Bundesbank','Central banking and banking supervision information','https://www.bundesbank.de/en']
    ],
    'Italy': [
      ['Banca d’Italia','Central banking, banking supervision and payments','https://www.bancaditalia.it/?com.dotmarketing.htmlpage.language=1'],
      ['Commissione Nazionale per le Società e la Borsa (CONSOB)','Securities markets and investment services','https://www.consob.it/web/consob-and-its-activities']
    ],
    'Spain': [
      ['Banco de España','Central banking and credit institution supervision','https://www.bde.es/wbe/en/'],
      ['Comisión Nacional del Mercado de Valores (CNMV)','Securities markets and investment services','https://www.cnmv.es/portal/home.aspx?lang=en']
    ],
    'Netherlands': [
      ['De Nederlandsche Bank (DNB)','Prudential supervision and central banking','https://www.dnb.nl/en/'],
      ['Authority for the Financial Markets (AFM)','Conduct supervision and financial markets','https://www.afm.nl/en']
    ],
    'Ireland': [
      ['Central Bank of Ireland','Financial regulation, supervision and consumer protection','https://www.centralbank.ie/']
    ],
    'Poland': [
      ['Polish Financial Supervision Authority (KNF)','Financial market supervision','https://www.knf.gov.pl/en/'],
      ['National Bank of Poland','Central banking and monetary policy','https://nbp.pl/en/']
    ],
    'Sweden': [
      ['Finansinspektionen','Financial markets and financial institution supervision','https://www.fi.se/en/'],
      ['Sveriges Riksbank','Central banking and payments','https://www.riksbank.se/en-gb/']
    ],
    'Denmark': [
      ['Danish Financial Supervisory Authority (Finanstilsynet)','Financial institution and market supervision','https://www.dfsa.dk/'],
      ['Danmarks Nationalbank','Central banking and financial stability','https://www.nationalbanken.dk/en']
    ],
    'Belgium': [
      ['National Bank of Belgium (NBB)','Prudential supervision and central banking','https://www.nbb.be/en'],
      ['Financial Services and Markets Authority (FSMA)','Financial markets and conduct supervision','https://www.fsma.be/en']
    ],
    'Austria': [
      ['Austrian Financial Market Authority (FMA)','Financial market supervision','https://www.fma.gv.at/en/'],
      ['Oesterreichische Nationalbank (OeNB)','Central banking and financial stability','https://www.oenb.at/en/']
    ],
    'Portugal': [
      ['Banco de Portugal','Central banking and banking supervision','https://www.bportugal.pt/en'],
      ['Portuguese Securities Market Commission (CMVM)','Securities and investment services','https://www.cmvm.pt/']
    ],
    'Greece': [
      ['Bank of Greece','Central banking and financial supervision','https://www.bankofgreece.gr/en/homepage'],
      ['Hellenic Capital Market Commission','Capital markets and investment services','https://www.hcmc.gr/en_US/web/portal/home']
    ],
    'Finland': [
      ['Finnish Financial Supervisory Authority (FIN-FSA)','Financial institution and market supervision','https://www.finanssivalvonta.fi/en/'],
      ['Bank of Finland','Central banking and payment systems','https://www.suomenpankki.fi/en/']
    ],
    'Luxembourg': [
      ['Commission de Surveillance du Secteur Financier (CSSF)','Financial sector supervision','https://www.cssf.lu/en/'],
      ['Commission de Surveillance du Secteur des Assurances (CAA)','Insurance supervision','https://caa.public.lu/en.html']
    ],
    'Malta': [
      ['Malta Financial Services Authority (MFSA)','Financial services regulation and supervision','https://www.mfsa.mt/'],
      ['Central Bank of Malta','Central banking and payment systems','https://www.centralbankmalta.org/']
    ],
    'Iceland': [
      ['Central Bank of Iceland','Central banking and financial supervision','https://www.cb.is/'],
      ['Financial Supervisory Authority functions — Central Bank of Iceland','Financial supervision and market conduct','https://www.cb.is/']
    ],
    'Norway': [
      ['Finanstilsynet — Financial Supervisory Authority of Norway','Financial institution and market supervision','https://www.finanstilsynet.no/en/'],
      ['Norges Bank','Central banking and payment systems','https://www.norges-bank.no/en/']
    ],
    'Switzerland': [
      ['Swiss Financial Market Supervisory Authority (FINMA)','Banking, insurance, securities and financial market supervision','https://www.finma.ch/en/'],
      ['Swiss National Bank (SNB)','Central banking and financial stability','https://www.snb.ch/en']
    ],
    'Türkiye': [
      ['Banking Regulation and Supervision Agency (BRSA / BDDK)','Banking regulation and supervision','https://www.bddk.org.tr/Content/English'],
      ['Central Bank of the Republic of Türkiye (CBRT)','Central banking and payments','https://www.tcmb.gov.tr/wps/wcm/connect/EN/TCMB+EN'],
      ['Capital Markets Board of Türkiye (CMB)','Capital markets','https://spk.gov.tr/Sayfa/Index/0/0/1']
    ],
    'Bahrain': [
      ['Central Bank of Bahrain (CBB)','Integrated financial regulator and central bank','https://www.cbb.gov.bh/']
    ],
    'Qatar': [
      ['Qatar Central Bank (QCB)','Central banking and financial institution supervision','https://www.qcb.gov.qa/en/'],
      ['Qatar Financial Markets Authority (QFMA)','Capital markets','https://www.qfma.org.qa/']
    ],
    'Kuwait': [
      ['Central Bank of Kuwait (CBK)','Central banking and banking supervision','https://www.cbk.gov.kw/en'],
      ['Capital Markets Authority Kuwait','Capital markets regulation','https://www.cma.gov.kw/']
    ],
    'Oman': [
      ['Central Bank of Oman (CBO)','Central banking and financial institution supervision','https://cbo.gov.om/'],
      ['Financial Services Authority Oman','Capital markets and insurance supervision','https://fsa.gov.om/']
    ],
    'Jordan': [
      ['Central Bank of Jordan (CBJ)','Central banking and financial sector supervision','https://www.cbj.gov.jo/'],
      ['Jordan Securities Commission (JSC)','Securities markets','https://www.jsc.gov.jo/']
    ],
    'Israel': [
      ['Bank of Israel','Central banking and banking supervision','https://www.boi.org.il/en/'],
      ['Israel Securities Authority (ISA)','Securities markets','https://www.new.isa.gov.il/en/']
    ],
    'Nigeria': [
      ['Central Bank of Nigeria (CBN)','Central banking and banking supervision','https://www.cbn.gov.ng/'],
      ['Securities and Exchange Commission Nigeria','Capital markets','https://sec.gov.ng/'],
      ['Nigeria Financial Intelligence Unit (NFIU)','Financial intelligence and AML/CFT','https://www.nfiu.gov.ng/']
    ],
    'Kenya': [
      ['Central Bank of Kenya (CBK)','Central banking, banking and payment services','https://www.centralbank.go.ke/'],
      ['Capital Markets Authority Kenya','Capital markets','https://www.cma.or.ke/'],
      ['Financial Reporting Centre (FRC)','Financial intelligence and AML/CFT','https://www.frc.go.ke/']
    ],
    'Ghana': [
      ['Bank of Ghana','Central banking, banking supervision and payments','https://www.bog.gov.gh/'],
      ['Securities and Exchange Commission Ghana','Capital markets','https://sec.gov.gh/'],
      ['Financial Intelligence Centre Ghana','Financial intelligence and AML/CFT','https://fic.gov.gh/']
    ],
    'Rwanda': [
      ['National Bank of Rwanda (BNR)','Central banking and financial sector supervision','https://www.bnr.rw/']
    ],
    'Egypt': [
      ['Central Bank of Egypt (CBE)','Central banking and banking supervision','https://www.cbe.org.eg/en'],
      ['Financial Regulatory Authority (FRA)','Non-banking financial markets and services','https://fra.gov.eg/']
    ],
    'Morocco': [
      ['Bank Al-Maghrib','Central banking and banking supervision','https://www.bkam.ma/en'],
      ['Moroccan Capital Market Authority (AMMC)','Capital markets','https://www.ammc.ma/en']
    ],
    'Mauritius': [
      ['Bank of Mauritius','Central banking and banking supervision','https://www.bom.mu/'],
      ['Financial Services Commission Mauritius','Non-bank financial services supervision','https://www.fscmauritius.org/']
    ],
    'Tanzania': [
      ['Bank of Tanzania','Central banking and financial institution supervision','https://www.bot.go.tz/'],
      ['Capital Markets and Securities Authority Tanzania','Capital markets','https://www.cmsa.go.tz/']
    ],
    'Uganda': [
      ['Bank of Uganda','Central banking and banking supervision','https://www.bou.or.ug/'],
      ['Capital Markets Authority Uganda','Capital markets','https://cmauganda.co.ug/']
    ],
    'Ethiopia': [
      ['National Bank of Ethiopia','Central banking and financial institution supervision','https://nbe.gov.et/']
    ],
    'Senegal / WAEMU': [
      ['Central Bank of West African States (BCEAO)','Regional central bank and banking framework for WAEMU member states','https://www.bceao.int/en'],
      ['Regional Council for Public Savings and Financial Markets (CREPMF)','Regional financial market supervision','https://www.crepmf.org/']
    ],
    'Côte d’Ivoire': [
      ['Central Bank of West African States (BCEAO)','Regional central bank and banking framework','https://www.bceao.int/en'],
      ['Regional Council for Public Savings and Financial Markets (CREPMF)','Regional financial market supervision','https://www.crepmf.org/']
    ],
    'Côte d’Ivoire / WAEMU regional record': [
      ['Central Bank of West African States (BCEAO)','Regional central bank and banking framework for WAEMU member states','https://www.bceao.int/en'],
      ['Regional Council for Public Savings and Financial Markets (CREPMF)','Regional financial market supervision','https://www.crepmf.org/']
    ],
    'CEMAC regional framework': [
      ['Bank of Central African States (BEAC)','Regional central bank for CEMAC member states','https://www.beac.int/'],
      ['Central African Banking Commission (COBAC)','Regional banking supervision','https://www.sgcobac.org/']
    ],
    'Mexico': [
      ['Bank of Mexico (Banco de México)','Central banking and payment systems','https://www.banxico.org.mx/'],
      ['National Banking and Securities Commission (CNBV)','Banking and securities institution supervision','https://www.gob.mx/cnbv'],
      ['National Commission for the Protection and Defense of Users of Financial Services (CONDUSEF)','Financial consumer protection','https://www.condusef.gob.mx/']
    ],
    'Chile': [
      ['Financial Market Commission (CMF)','Banking, insurance and securities supervision','https://www.cmfchile.cl/portal/principal/613/w3-channel.html'],
      ['Central Bank of Chile','Central banking and payments','https://www.bcentral.cl/en/home']
    ],
    'Colombia': [
      ['Financial Superintendence of Colombia','Financial institution and market supervision','https://www.superfinanciera.gov.co/'],
      ['Banco de la República','Central banking and payments','https://www.banrep.gov.co/en']
    ],
    'Argentina': [
      ['Central Bank of the Argentine Republic (BCRA)','Central banking and banking supervision','https://www.bcra.gob.ar/'],
      ['National Securities Commission (CNV)','Capital markets','https://www.argentina.gob.ar/cnv']
    ],
    'Peru': [
      ['Superintendence of Banking, Insurance and Private Pension Fund Administrators (SBS)','Banking, insurance and pension supervision','https://www.sbs.gob.pe/eng/'],
      ['Superintendencia del Mercado de Valores (SMV)','Capital markets','https://www.smv.gob.pe/']
    ],
    'The Bahamas': [
      ['Central Bank of The Bahamas','Central banking and financial institution supervision','https://www.centralbankbahamas.com/'],
      ['Securities Commission of The Bahamas','Securities and capital markets','https://scb.gov.bs/']
    ],
    'Jamaica': [
      ['Bank of Jamaica','Central banking and financial institution supervision','https://boj.org.jm/'],
      ['Financial Services Commission Jamaica','Pensions, insurance and securities oversight','https://www.fscjamaica.org/']
    ],
    'Kazakhstan': [
      ['National Bank of Kazakhstan','Central banking and monetary policy','https://nationalbank.kz/en'],
      ['Agency for Regulation and Development of the Financial Market','Financial market supervision','https://www.gov.kz/memleket/entities/ardfm?lang=en']
    ],
    'Uzbekistan': [
      ['Central Bank of the Republic of Uzbekistan','Central banking and financial institution supervision','https://cbu.uz/en/']
    ],
    'Thailand': [
      ['Bank of Thailand','Central banking, payments and financial institution supervision','https://www.bot.or.th/en/home.html'],
      ['Securities and Exchange Commission Thailand','Capital markets','https://www.sec.or.th/EN/Pages/Home.aspx'],
      ['Anti-Money Laundering Office Thailand (AMLO)','AML/CFT authority','https://www.amlo.go.th/index.php/en']
    ],
    'Philippines': [
      ['Bangko Sentral ng Pilipinas (BSP)','Central banking, banking supervision and payments','https://www.bsp.gov.ph/'],
      ['Securities and Exchange Commission Philippines','Securities markets and corporate regulation','https://www.sec.gov.ph/'],
      ['Anti-Money Laundering Council (AMLC)','Financial intelligence and AML/CFT','https://www.amlc.gov.ph/']
    ],
    'Vietnam': [
      ['State Bank of Vietnam','Central banking and banking supervision','https://www.sbv.gov.vn/webcenter/portal/en/home'],
      ['State Securities Commission of Vietnam','Securities markets','https://ssc.gov.vn/webcenter/portal/en/home']
    ],
    'Nepal': [
      ['Nepal Rastra Bank','Central banking and financial institution supervision','https://www.nrb.org.np/'],
      ['Securities Board of Nepal (SEBON)','Capital markets','https://www.sebon.gov.np/']
    ],
    'New Zealand': [
      ['Reserve Bank of New Zealand (RBNZ)','Central banking and prudential regulation','https://www.rbnz.govt.nz/'],
      ['Financial Markets Authority (FMA)','Financial markets and conduct regulation','https://www.fma.govt.nz/']
    ],
    'Chinese Taipei': [
      ['Central Bank of the Republic of China (Taiwan)','Central banking and payment systems','https://www.cbc.gov.tw/en/mp-2.html'],
      ['Financial Supervisory Commission (FSC)','Banking, insurance and securities supervision','https://www.fsc.gov.tw/en/']
    ],
    'Taiwan': [
      ['Central Bank of the Republic of China (Taiwan)','Central banking and payment systems','https://www.cbc.gov.tw/en/mp-2.html'],
      ['Financial Supervisory Commission (FSC)','Banking, insurance and securities supervision','https://www.fsc.gov.tw/en/']
    ],
    'Fiji': [
      ['Reserve Bank of Fiji','Central banking and financial institution supervision','https://www.rbf.gov.fj/']
    ],
    'Macau SAR': [
      ['Monetary Authority of Macao (AMCM)','Monetary and financial supervision','https://www.amcm.gov.mo/en']
    ],
    'Macao, China': [
      ['Monetary Authority of Macao (AMCM)','Monetary and financial supervision','https://www.amcm.gov.mo/en']
    ],
    'Cayman Islands': [
      ['Cayman Islands Monetary Authority (CIMA)','Financial services supervision','https://www.cima.ky/']
    ],
    'British Virgin Islands': [
      ['British Virgin Islands Financial Services Commission','Financial services supervision','https://www.bvifsc.vg/']
    ],
    'Bermuda': [
      ['Bermuda Monetary Authority (BMA)','Integrated financial regulator and monetary authority','https://www.bma.bm/']
    ],
    'Jersey': [
      ['Jersey Financial Services Commission (JFSC)','Financial services supervision','https://www.jerseyfsc.org/']
    ],
    'Guernsey': [
      ['Guernsey Financial Services Commission (GFSC)','Financial services supervision','https://www.gfsc.gg/']
    ],
    'Isle of Man': [
      ['Isle of Man Financial Services Authority','Financial services supervision','https://www.iomfsa.im/']
    ],
    'Gibraltar': [
      ['Gibraltar Financial Services Commission','Financial services supervision','https://www.fsc.gi/']
    ],
    'Curaçao': [
      ['Centrale Bank van Curaçao en Sint Maarten (CBCS)','Central banking and financial sector supervision','https://www.centralbank.cw/']
    ],
    'Curaçao and Sint Maarten': [
      ['Centrale Bank van Curaçao en Sint Maarten (CBCS)','Central banking and financial sector supervision','https://www.centralbank.cw/']
    ],
    'Sint Maarten': [
      ['Centrale Bank van Curaçao en Sint Maarten (CBCS)','Central banking and financial sector supervision','https://www.centralbank.cw/']
    ],
    'Anguilla': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Anguilla Financial Services Commission','Non-bank financial services oversight','https://fsc.org.ai/']
    ],
    'Antigua and Barbuda': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Antigua and Barbuda Financial Services Regulatory Commission','Financial services oversight','https://www.fsrc.gov.ag/']
    ],
    'Dominica': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Financial Services Unit Dominica','Non-bank financial services oversight','https://fsu.gov.dm/']
    ],
    'Grenada': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Grenada Authority for the Regulation of Financial Institutions (GARFIN)','Non-bank financial services oversight','https://garfin.gd/']
    ],
    'Montserrat': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Financial Services Commission Montserrat','Non-bank financial services oversight','https://www.fscmontserrat.org/']
    ],
    'Saint Kitts and Nevis': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Nevis Financial Services Regulatory Commission','Financial services oversight','https://www.nevisfsrc.com/']
    ],
    'Saint Lucia': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Financial Services Regulatory Authority Saint Lucia','Non-bank financial services oversight','https://www.fsrastlucia.org/']
    ],
    'Saint Vincent and the Grenadines': [
      ['Eastern Caribbean Central Bank (ECCB)','Central banking and banking supervision for ECCU members','https://www.eccb-centralbank.org/'],
      ['Financial Services Authority Saint Vincent and the Grenadines','Non-bank financial services oversight','https://fsasvg.com/']
    ],
    'Aruba': [
      ['Central Bank of Aruba','Central banking and financial sector supervision','https://www.cbaruba.org/']
    ],
    'Belize': [
      ['Central Bank of Belize','Central banking and financial institution supervision','https://www.centralbank.org.bz/'],
      ['Financial Services Commission Belize','Non-bank financial services supervision','https://www.belizefsc.org.bz/']
    ],
    'Guyana': [
      ['Bank of Guyana','Central banking and financial institution supervision','https://bankofguyana.org.gy/']
    ],
    'Suriname': [
      ['Central Bank of Suriname','Central banking and financial institution supervision','https://www.cbvs.sr/']
    ],
    'Bangladesh': [
      ['Bangladesh Bank','Banking, prudential regulation, payments and MFS','https://www.bb.org.bd/'],
      ['Bangladesh Financial Intelligence Unit (BFIU)','AML/CFT, financial intelligence, circulars and circular letters','https://www.bfiu.org.bd/index.php/legislation/circular'],
      ['Bangladesh Securities and Exchange Commission (BSEC)','Capital markets and securities','https://sec.gov.bd/'],
      ['Insurance Development and Regulatory Authority (IDRA)','Insurance supervision','https://idra.org.bd/'],
      ['Official laws and gazette sources','Acts, rules and gazette publications','https://bdlaws.minlaw.gov.bd/']
    ],
    'United States': [
      ['Federal Reserve','Bank supervision and financial stability','https://www.federalreserve.gov/'],
      ['Office of the Comptroller of the Currency (OCC)','National banks and federal savings associations','https://www.occ.gov/'],
      ['Federal Deposit Insurance Corporation (FDIC)','Deposit insurance and bank supervision','https://www.fdic.gov/'],
      ['FinCEN','AML/CFT and financial intelligence','https://www.fincen.gov/'],
      ['U.S. Securities and Exchange Commission (SEC)','Securities markets','https://www.sec.gov/'],
      ['Office of Foreign Assets Control (OFAC)','U.S. sanctions','https://ofac.treasury.gov/']
    ],
    'United Kingdom': [
      ['Financial Conduct Authority (FCA)','Financial services conduct and markets','https://www.fca.org.uk/'],
      ['Prudential Regulation Authority (PRA) / Bank of England','Prudential supervision','https://www.bankofengland.co.uk/prudential-regulation'],
      ['HM Treasury','Financial policy and sanctions policy','https://www.gov.uk/government/organisations/hm-treasury'],
      ['Office of Financial Sanctions Implementation (OFSI)','Financial sanctions implementation','https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation']
    ],
    'European Union (EU-level)': [
      ['European Commission','EU policy and legislative proposals','https://commission.europa.eu/'],
      ['European Banking Authority (EBA)','Banking and AML/CFT supervisory standards','https://www.eba.europa.eu/'],
      ['European Securities and Markets Authority (ESMA)','Securities and markets','https://www.esma.europa.eu/'],
      ['European Central Bank (ECB)','Euro-area banking supervision and monetary policy','https://www.bankingsupervision.europa.eu/'],
      ['EUR-Lex','Official EU law and legal acts','https://eur-lex.europa.eu/']
    ],
    'India': [
      ['Reserve Bank of India (RBI)','Banking, payments and financial regulation','https://www.rbi.org.in/'],
      ['Securities and Exchange Board of India (SEBI)','Securities markets','https://www.sebi.gov.in/'],
      ['Financial Intelligence Unit–India (FIU-IND)','AML/CFT reporting and financial intelligence','https://fiuindia.gov.in/']
    ],
    'Singapore': [
      ['Monetary Authority of Singapore (MAS)','Integrated financial regulator and central bank','https://www.mas.gov.sg/'],
      ['Singapore Statutes Online','Legislation and subsidiary legislation','https://sso.agc.gov.sg/']
    ],
    'China': [
      ['People’s Bank of China (PBOC)','Central banking and payments','http://www.pbc.gov.cn/'],
      ['National Financial Regulatory Administration (NFRA)','Financial sector supervision','https://www.nfra.gov.cn/'],
      ['China Securities Regulatory Commission (CSRC)','Securities regulation','http://www.csrc.gov.cn/']
    ],
    'Japan': [
      ['Financial Services Agency (JFSA)','Financial supervision and regulation','https://www.fsa.go.jp/en/'],
      ['Bank of Japan','Central banking and financial system','https://www.boj.or.jp/en/']
    ],
    'South Korea': [
      ['Financial Services Commission (FSC)','Financial policy and regulation','https://www.fsc.go.kr/eng/'],
      ['Financial Supervisory Service (FSS)','Financial supervision','https://www.fss.or.kr/eng/']
    ],
    'Australia': [
      ['Australian Prudential Regulation Authority (APRA)','Prudential supervision','https://www.apra.gov.au/'],
      ['Australian Securities and Investments Commission (ASIC)','Financial services and markets','https://asic.gov.au/'],
      ['AUSTRAC','AML/CTF regulator and financial intelligence','https://www.austrac.gov.au/']
    ],
    'Canada': [
      ['Office of the Superintendent of Financial Institutions (OSFI)','Prudential supervision','https://www.osfi-bsif.gc.ca/'],
      ['Financial Transactions and Reports Analysis Centre of Canada (FINTRAC)','AML/ATF and financial intelligence','https://fintrac-canafe.canada.ca/'],
      ['Bank of Canada','Central banking and payment systems','https://www.bankofcanada.ca/']
    ],
    'Malaysia': [
      ['Bank Negara Malaysia (BNM)','Central bank and financial regulation','https://www.bnm.gov.my/'],
      ['Securities Commission Malaysia','Capital markets','https://www.sc.com.my/']
    ],
    'Indonesia': [
      ['Bank Indonesia (BI)','Central banking and payment systems','https://www.bi.go.id/'],
      ['Otoritas Jasa Keuangan (OJK)','Financial services supervision','https://www.ojk.go.id/']
    ],
    'Pakistan': [
      ['State Bank of Pakistan (SBP)','Banking and payments','https://www.sbp.org.pk/'],
      ['Securities and Exchange Commission of Pakistan (SECP)','Securities and corporate regulation','https://www.secp.gov.pk/'],
      ['Financial Monitoring Unit (FMU)','Financial intelligence','https://www.fmu.gov.pk/']
    ],
    'Sri Lanka': [
      ['Central Bank of Sri Lanka','Banking and financial regulation','https://www.cbsl.gov.lk/'],
      ['Financial Intelligence Unit of Sri Lanka','AML/CFT and financial intelligence','https://fiusrilanka.gov.lk/']
    ],
    'United Arab Emirates (federal)': [
      ['Central Bank of the UAE (CBUAE)','Banking, payments and insurance','https://www.centralbank.ae/'],
      ['Securities and Commodities Authority (SCA)','Securities and commodities markets','https://www.sca.gov.ae/'],
      ['UAE Financial Intelligence Unit','Financial intelligence and AML/CFT','https://www.uaefiu.gov.ae/']
    ],
    'Saudi Arabia': [
      ['Saudi Central Bank (SAMA)','Banking, payments and insurance','https://www.sama.gov.sa/'],
      ['Capital Market Authority (CMA)','Capital markets','https://cma.org.sa/']
    ],
    'South Africa': [
      ['South African Reserve Bank (SARB)','Central banking and prudential supervision','https://www.resbank.co.za/'],
      ['Financial Intelligence Centre (FIC)','AML/CFT and financial intelligence','https://www.fic.gov.za/'],
      ['Financial Sector Conduct Authority (FSCA)','Financial services conduct','https://www.fsca.co.za/']
    ],
    'Brazil': [
      ['Banco Central do Brasil','Central banking and financial regulation','https://www.bcb.gov.br/en/'],
      ['Comissão de Valores Mobiliários (CVM)','Securities markets','https://www.gov.br/cvm/en']
    ],
    'Hong Kong': [
      ['Hong Kong Monetary Authority (HKMA)','Banking and monetary stability','https://www.hkma.gov.hk/'],
      ['Securities and Futures Commission (SFC)','Securities and futures markets','https://www.sfc.hk/'],
      ['Hong Kong Customs and Excise Department','AML/CFT for designated non-financial businesses and professions','https://www.customs.gov.hk/']
    ],
    "France": [
      ["Autorité de contrôle prudentiel et de résolution (ACPR)","Banking and insurance prudential supervision; verify activity-specific scope","https://acpr.banque-france.fr/"],
      ["Banque de France","Central banking, payments and financial stability","https://www.banque-france.fr/en"],
      ["Autorité des marchés financiers (AMF)","Financial markets and investment services","https://www.amf-france.org/en"],
      ["TRACFIN","Financial intelligence and AML/CFT","https://www.economie.gouv.fr/tracfin"],
      ["Legifrance","Official French legislation and regulatory texts","https://www.legifrance.gouv.fr/"]
    ],
    "Germany": [
      ["Federal Financial Supervisory Authority (BaFin)","Financial services, banking, securities and insurance supervision","https://www.bafin.de/EN/Homepage/homepage_node.html"],
      ["Deutsche Bundesbank","Central banking and banking supervision functions","https://www.bundesbank.de/en"],
      ["Financial Intelligence Unit Germany (FIU)","Financial intelligence and suspicious transaction reporting","https://www.zoll.de/EN/Home/home_node.html"],
      ["Gesetze im Internet","Official federal legislation portal","https://www.gesetze-im-internet.de/"]
    ],
    "Italy": [
      ["Banca d’Italia","Banking supervision, payments and financial stability","https://www.bancaditalia.it/?com.dotmarketing.htmlpage.language=1"],
      ["Commissione Nazionale per le Società e la Borsa (CONSOB)","Securities markets and investment services","https://www.consob.it/web/consob-and-its-activities"],
      ["Unità di Informazione Finanziaria per l’Italia (UIF)","Financial intelligence and AML/CFT","https://uif.bancaditalia.it/?com.dotmarketing.htmlpage.language=1"],
      ["Normattiva","Official Italian legislation portal","https://www.normattiva.it/"]
    ],
    "Spain": [
      ["Banco de España","Banking supervision and payments","https://www.bde.es/wbe/en/"],
      ["Comisión Nacional del Mercado de Valores (CNMV)","Securities markets","https://www.cnmv.es/portal/home.aspx?lang=en"],
      ["SEPBLAC","Financial intelligence and AML/CFT","https://www.sepblac.es/en/"],
      ["Boletín Oficial del Estado (BOE)","Official state gazette and legislation","https://www.boe.es/"]
    ],
    "Netherlands": [
      ["De Nederlandsche Bank (DNB)","Prudential supervision and central banking","https://www.dnb.nl/en/"],
      ["Authority for the Financial Markets (AFM)","Financial markets and conduct supervision","https://www.afm.nl/en"],
      ["FIU-The Netherlands","Financial intelligence and unusual transaction reporting","https://www.fiu-nederland.nl/en"],
      ["wetten.nl","Official Dutch legislation portal","https://wetten.overheid.nl/"]
    ],
    "Ireland": [
      ["Central Bank of Ireland","Financial regulation, supervision and consumer protection","https://www.centralbank.ie/"],
      ["Department of Finance","Financial services policy and legislation","https://www.gov.ie/en/organisation/department-of-finance/"],
      ["Irish Statute Book","Official Irish legislation","https://www.irishstatutebook.ie/"]
    ],
    "Poland": [
      ["Polish Financial Supervision Authority (KNF)","Financial market supervision","https://www.knf.gov.pl/en/"],
      ["General Inspector of Financial Information (GIIF)","Financial intelligence and AML/CFT","https://www.gov.pl/web/finance/general-inspector-of-financial-information"],
      ["Internet System of Legal Acts (ISAP)","Official legal acts database","https://isap.sejm.gov.pl/"]
    ],
    "Sweden": [
      ["Finansinspektionen (Swedish Financial Supervisory Authority)","Financial market supervision","https://www.fi.se/en/"],
      ["Sveriges Riksbank","Central banking and payments","https://www.riksbank.se/en-gb/"],
      ["Swedish Police Financial Intelligence Unit","Financial intelligence and suspicious transaction reporting; confirm current official route","https://polisen.se/en/"]
    ],
    "Denmark": [
      ["Danish Financial Supervisory Authority (Finanstilsynet)","Financial sector supervision","https://www.dfsa.dk/"],
      ["Danmarks Nationalbank","Central banking and payment systems","https://www.nationalbanken.dk/en"],
      ["Retsinformation","Official Danish legislation portal","https://www.retsinformation.dk/"]
    ],
    "Belgium": [
      ["National Bank of Belgium (NBB)","Prudential supervision and financial stability","https://www.nbb.be/en"],
      ["Financial Services and Markets Authority (FSMA)","Financial markets and conduct supervision","https://www.fsma.be/en"],
      ["CTIF-CFI","Financial intelligence and AML/CFT","https://www.ctif-cfi.be/"]
    ],
    "Austria": [
      ["Financial Market Authority (FMA)","Financial market supervision","https://www.fma.gv.at/en/"],
      ["Oesterreichische Nationalbank (OeNB)","Central banking and financial stability","https://www.oenb.at/en/"],
      ["RIS — Rechtsinformationssystem des Bundes","Official Austrian legal information system","https://www.ris.bka.gv.at/"]
    ],
    "Portugal": [
      ["Banco de Portugal","Banking supervision and payments","https://www.bportugal.pt/en"],
      ["Portuguese Securities Market Commission (CMVM)","Securities markets","https://www.cmvm.pt/EN/Pages/homepage.aspx"],
      ["Diário da República Eletrónico","Official Portuguese legal gazette","https://diariodarepublica.pt/"]
    ],
    "Greece": [
      ["Bank of Greece","Central banking and financial supervision","https://www.bankofgreece.gr/en"],
      ["Hellenic Capital Market Commission (HCMC)","Capital markets","https://www.hcmc.gr/en_US/web/portal/home"],
      ["Government Gazette / National Printing House","Official legislation publication portal","https://search.et.gr/en/"]
    ],
    "Finland": [
      ["Finnish Financial Supervisory Authority (FIN-FSA)","Financial and insurance supervision","https://www.finanssivalvonta.fi/en/"],
      ["Bank of Finland","Central banking and payment systems","https://www.suomenpankki.fi/en/"],
      ["Finlex","Official Finnish legislation database","https://www.finlex.fi/en/"]
    ],
    "Luxembourg": [
      ["Commission de Surveillance du Secteur Financier (CSSF)","Financial sector supervision","https://www.cssf.lu/en/"],
      ["Commissariat aux Assurances (CAA)","Insurance supervision","https://www.caa.lu/en"],
      ["Legilux","Official Luxembourg legal portal","https://legilux.public.lu/"]
    ],
    "Malta": [
      ["Malta Financial Services Authority (MFSA)","Financial services supervision","https://www.mfsa.mt/"],
      ["Financial Intelligence Analysis Unit (FIAU)","AML/CFT supervision and financial intelligence","https://fiaumalta.org/"],
      ["Legislation Malta","Official legislation portal","https://legislation.mt/"]
    ],
    "Iceland": [
      ["Central Bank of Iceland — Financial Supervision","Financial supervision and central banking","https://www.cb.is/"],
      ["Icelandic Financial Intelligence Unit","Financial intelligence and AML/CFT; confirm official contact/source route","https://www.cb.is/"],
      ["Althingi legislation portal","Official Icelandic legislation","https://www.althingi.is/english/"]
    ],
    "Norway": [
      ["Finanstilsynet (Financial Supervisory Authority of Norway)","Financial market supervision","https://www.finanstilsynet.no/en/"],
      ["Norges Bank","Central banking and payment systems","https://www.norges-bank.no/en/"],
      ["Lovdata","Norwegian legal information portal","https://lovdata.no/"]
    ],
    "Switzerland": [
      ["Swiss Financial Market Supervisory Authority (FINMA)","Financial market supervision","https://www.finma.ch/en/"],
      ["Swiss National Bank (SNB)","Central banking and financial stability","https://www.snb.ch/en"],
      ["Federal Office of Police — MROS","Money laundering reporting office / financial intelligence","https://www.fedpol.admin.ch/fedpol/en/home/kriminalitaet/geldwaescherei.html"],
      ["Fedlex","Official Swiss law portal","https://www.fedlex.admin.ch/en/home"]
    ],
    "New Zealand": [
      ["Reserve Bank of New Zealand (RBNZ)","Banking, insurance and financial stability supervision","https://www.rbnz.govt.nz/"],
      ["Financial Markets Authority (FMA)","Financial markets conduct and regulation","https://www.fma.govt.nz/"],
      ["New Zealand Police Financial Intelligence Unit","Financial intelligence and AML/CFT","https://www.police.govt.nz/advice/businesses-and-organisations/fiu"],
      ["New Zealand Legislation","Official legislation portal","https://www.legislation.govt.nz/"]
    ],
    "Mexico": [
      ["Comisión Nacional Bancaria y de Valores (CNBV)","Banking and securities supervision","https://www.gob.mx/cnbv"],
      ["Banco de México","Central banking and payment systems","https://www.banxico.org.mx/"],
      ["Unidad de Inteligencia Financiera (UIF)","Financial intelligence and AML/CFT","https://www.gob.mx/hacienda"],
      ["Diario Oficial de la Federación","Official federal gazette","https://www.dof.gob.mx/"]
    ],
    "Thailand": [
      ["Bank of Thailand (BOT)","Central banking, payments and financial institutions","https://www.bot.or.th/en/home.html"],
      ["Securities and Exchange Commission, Thailand (SEC)","Securities and digital-asset markets","https://www.sec.or.th/EN/Pages/Home.aspx"],
      ["Anti-Money Laundering Office (AMLO)","AML/CFT and financial intelligence","https://www.amlo.go.th/"]
    ],
    "Philippines": [
      ["Bangko Sentral ng Pilipinas (BSP)","Banking, payments and financial supervision","https://www.bsp.gov.ph/"],
      ["Securities and Exchange Commission (SEC)","Securities and corporate regulation","https://www.sec.gov.ph/"],
      ["Anti-Money Laundering Council (AMLC)","Financial intelligence and AML/CFT","https://www.amlc.gov.ph/"]
    ],
    "Vietnam": [
      ["State Bank of Vietnam (SBV)","Central banking and payments","https://www.sbv.gov.vn/"],
      ["State Securities Commission of Vietnam (SSC)","Securities markets","https://www.ssc.gov.vn/"],
      ["Vietnam Government Portal","Government decisions and legal documents starting point","https://vanban.chinhphu.vn/"]
    ],
    "Nepal": [
      ["Nepal Rastra Bank (NRB)","Central banking and financial institution supervision","https://www.nrb.org.np/"],
      ["Securities Board of Nepal (SEBON)","Securities markets","https://www.sebon.gov.np/"],
      ["Department of Money Laundering Investigation (DMLI)","AML/CFT investigation and implementation","https://dmli.gov.np/"]
    ],
    "Kenya": [
      ["Central Bank of Kenya (CBK)","Banking, payments and financial stability","https://www.centralbank.go.ke/"],
      ["Capital Markets Authority (CMA) Kenya","Capital markets","https://www.cma.or.ke/"],
      ["Financial Reporting Centre (FRC)","Financial intelligence and AML/CFT","https://www.frc.go.ke/"]
    ],
    "Nigeria": [
      ["Central Bank of Nigeria (CBN)","Banking and payment systems","https://www.cbn.gov.ng/"],
      ["Securities and Exchange Commission Nigeria","Capital markets","https://sec.gov.ng/"],
      ["Nigerian Financial Intelligence Unit (NFIU)","Financial intelligence and AML/CFT","https://www.nfiu.gov.ng/"]
    ],
    "Ghana": [
      ["Bank of Ghana","Central banking and financial regulation","https://www.bog.gov.gh/"],
      ["Securities and Exchange Commission Ghana","Capital markets","https://sec.gov.gh/"],
      ["Financial Intelligence Centre (FIC)","Financial intelligence and AML/CFT","https://fic.gov.gh/"]
    ],
    "Egypt": [
      ["Central Bank of Egypt (CBE)","Central banking and banking supervision","https://www.cbe.org.eg/en"],
      ["Financial Regulatory Authority (FRA)","Non-banking financial markets","https://fra.gov.eg/"],
      ["Egyptian Money Laundering and Terrorist Financing Combating Unit","Financial intelligence and AML/CFT; confirm current official publications","https://www.cbe.org.eg/en"]
    ],
    'Global standards and cross-border frameworks': [
      ['FATF','Global AML/CFT/CPF standards; verify domestic implementation separately','https://www.fatf-gafi.org/'],
      ['BIS / Basel Committee on Banking Supervision','Prudential banking standards and guidance','https://www.bis.org/committees/bcbs/overview'],
      ['Financial Stability Board (FSB)','Financial stability policy coordination and recommendations','https://www.fsb.org/'],
      ['CPMI','Payments and financial market infrastructures','https://www.bis.org/committees/cpmi/overview'],
      ['IOSCO','International securities regulation','https://www.iosco.org/'],
      ['IAIS','Insurance supervision standards','https://www.iais.org/'],
      ['APG','Asia/Pacific AML/CFT regional body; not a domestic regulator','https://www.fatf-gafi.org/en/countries/global-network/asia-pacific-group-on-money-laundering--apg-.html'],
      ['Egmont Group','FIU cooperation network; not an FSRB or domestic regulator','https://egmontgroup.org/members-by-region/'],
      ['UN Security Council sanctions','Official sanctions regimes and information','https://main.un.org/securitycouncil/en/sanctions/information'],
      ['IMF','Financial stability surveillance and technical assistance','https://www.imf.org/en/Home'],
      ['World Bank','Financial inclusion, development and policy research','https://www.worldbank.org/ext/en/home'],
      ['OECD','Policy guidance, AI principles and digital economy','https://www.oecd.org/']
    ]
  };
  const bdCirculars = [
    ['2026-09-30','BFIU Circular No. 33','NGO/NPO','Instructions for NGO/NPOs for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep302026bfiu33b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-09-24','BFIU Circular No. 32','PSP/PSO','Instructions for PSP/PSO for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep242026bfiu32b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-09-15','BFIU Circular No. 31','Capital-market intermediaries','Instructions for capital market intermediaries for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep152026bfiu31.pdf','Catalogue metadata only; full text not verified'],
    ['2026-08-18','BFIU Circular No. 30','Money changers','Instructions for money changers to comply with MLPA 2012 and ATA 2009','https://www.bfiu.org.bd/pdf/circular/aml/aug182026bfiu30b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-03-30','BFIU Circular No. 29','Insurance companies and capital market intermediaries','Guidelines on e-KYC for Insurance Companies and CMIs','https://www.bfiu.org.bd/pdf/circular/aml/mar302026bfiu29e.pdf','Partial metadata/indexed text; clause review pending'],
    ['2023-05-30','BFIU Circular No. 28','Financial institutions','Instructions for FIs for prevention of ML, TF and PF','','Full text not reviewed in this pass'],
    ['2022-04-18','BFIU Circular No. 27','Insurance companies','Instructions for insurance companies for prevention of ML, TF and PF','','Full text not reviewed in this pass'],
    ['2020-06-16','BFIU Circular No. 26','Scheduled banks','Instructions for scheduled banks for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/jun162020bfiu26.pdf','Partial full-text verification: CTR paragraph 6 and STR paragraph 7 reviewed; later amendments require review'],
    ['2020-01-08','BFIU Circular No. 25','e-KYC — general','Guidelines on Electronic Know Your Customer (e-KYC)','','Full text not reviewed; later sector-specific circular listed separately'],
    ['2019-12-10','BFIU Circular No. 24','Trade-based money laundering / trade finance','Guidelines for Prevention of Trade Based Money Laundering','https://www.bfiu.org.bd/pdf/circular/aml/dec102019bfiu24.pdf','Partial: cover/instruction letter reviewed; underlying guideline and later extension not fully reviewed'],
    ['2019-01-31','BFIU Circular No. 23','Financial institution groups / internal control','Internal control and foreign branches/subsidiaries of financial institution group','','Catalogue metadata only'],
    ['2019-01-31','BFIU Circular No. 22','Information exchange among reporting organisations','Exchange of information among reporting organizations','','Catalogue metadata only'],
    ['2017-09-17','BFIU Circular No. 20','Mobile financial services','Instructions for MFS institutions for prevention of ML, TF and PF','','Catalogue metadata only; later instruments do not alone prove repeal'],
    ['2017-09-17','BFIU Circular No. 19','Scheduled banks','Instructions for scheduled banks for prevention of ML, TF and PF','','Historical sectoral circular; amendment/repeal relationship requires review'],
    ['2015-07-09','BFIU Circular No. 13','DNFBPs / real estate / precious metals / TCSP / legal and accounting professions','Instructions for listed DNFBPs and professions for prevention of ML and TF','','Catalogue metadata only'],
    ['2015-09-02','BFIU Circular No. 14','NGO/NPO','Instructions for NGO/NPOs to comply with MLPA 2012 and ATA 2009','','Historical instrument; supersession relationship requires verification']
  ];
  const bdLetters = [
    ['2026-02-26','BFIU Circular Letter No. 04/2026','Scheduled banks; CTR reporting','Cancellation of BFIU Circular Letter No. 1','https://www.bfiu.org.bd/pdf/circular/aml/feb262026bfiul04.pdf','Partially verified: cancellation/effective date reviewed; full legal history remains open'],
    ['2026-02-05','BFIU Circular Letter No. 02/2026','Scheduled banks; transaction monitoring','Instructions for the Scheduled Banks for the Enforcement of Transaction Monitoring System','https://www.bfiu.org.bd/pdf/circular/aml/feb052026bfiul02.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-02-05','BFIU Circular Letter No. 03/2026','MFS; transaction monitoring','Instructions for the MFS for the Enforcement of Transaction Monitoring System','https://www.bfiu.org.bd/pdf/circular/aml/feb052026bfiul03.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-08-19','BFIU Circular Letter No. 05/2026','Reporting organisations; accounts related to freezing orders','Reporting of Related Accounts Following BFIU Freezing Order','https://www.bfiu.org.bd/pdf/circular/aml/aug192026bfiul5b.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-01-08','BFIU Circular Letter No. 01/2026 — HISTORICAL / CANCELLED','Scheduled banks; CTR reporting','Instructions to be followed by Scheduled Banks regarding submission of Cash Transaction Report (CTR)','https://www.bfiu.org.bd/pdf/circular/aml/jan082026bfiul01.pdf','Superseded/cancelled from 1 Mar 2026 per Letter 04/2026; historical evidence only']
  ];
  const form = root.querySelector('#rcw-form');
  const country = root.querySelector('#rcw-country');
  const authority = root.querySelector('#rcw-authority');
  const countrySearch = root.querySelector('#rcw-country-search');
  const authoritySearch = root.querySelector('#rcw-authority-search');
  const openSource = root.querySelector('#rcw-open-source');
  let authorityOptions = [];
  const instrument = root.querySelector('#rcw-instrument');
  const issueDate = root.querySelector('#rcw-issue-date');
  const referenceDate = root.querySelector('#rcw-reference-date');
  const circularNo = root.querySelector('#rcw-circular-no');
  const sourceUrl = root.querySelector('#rcw-source-url');
  const decision = root.querySelector('#rcw-decision');
  const facts = root.querySelector('#rcw-facts');
  const limitations = root.querySelector('#rcw-limitations');
  const output = root.querySelector('#rcw-output');
  const preview = root.querySelector('#rcw-report-preview');
  const evidenceTable = root.querySelector('#rcw-evidence-list');
  const status = root.querySelector('#rcw-status');
  const allOptions = (el, arr, placeholder) => {
    el.innerHTML = '';
    if (placeholder) { const opt=document.createElement('option'); opt.value=''; opt.textContent=placeholder; el.appendChild(opt); }
    arr.forEach(v=>{const opt=document.createElement('option'); opt.value=v; opt.textContent=v; el.appendChild(opt);});
  };
  allOptions(country, countryNames.slice().sort((a,b)=>a.localeCompare(b)), 'Select a country / jurisdiction');
  const countryOptions = Array.from(country.options).slice(1).map(o=>({value:o.value,text:o.textContent}));
  const filterSelect = (select, options, query, placeholder) => {
    const previous=select.value, q=(query||'').trim().toLocaleLowerCase();
    select.innerHTML=''; const first=document.createElement('option');first.value='';first.textContent=placeholder;select.appendChild(first);
    options.filter(o=>!q || o.text.toLocaleLowerCase().includes(q)).forEach(o=>{const el=document.createElement('option');el.value=o.value;el.textContent=o.text;if(o.focus)el.dataset.focus=o.focus;if(o.url)el.dataset.url=o.url;if(o.sourceKind)el.dataset.sourceKind=o.sourceKind;select.appendChild(el);});
    if(options.some(o=>o.value===previous)&&Array.from(select.options).some(o=>o.value===previous))select.value=previous;
  };
  countrySearch.addEventListener('input',()=>filterSelect(country,countryOptions,countrySearch.value,'Select a country / jurisdiction'));
  const directorySources = [
    ['BIS — Central bank directory','Starting point to identify a country’s central bank / monetary authority; verify the national regulator’s own website.','https://www.bis.org/cbanks.htm'],
    ['IOSCO — Securities regulators / members','Starting point for securities-market regulator identification; membership is not proof of jurisdictional scope.','https://www.iosco.org/about/?subsection=membership'],
    ['FATF Global Network','AML/CFT standard-setting and regional-body directory; distinguish standards from domestic binding law.','https://www.fatf-gafi.org/en/countries/global-network.html'],
    ['IMF country information','Country and financial-sector reference material; not a substitute for the issuing regulator’s instrument register.','https://www.imf.org/en/Countries'],
    ['World Bank country data','Country context and development / financial-inclusion data; not a legal instrument source.','https://data.worldbank.org/country']
  ];
  const renderAuthorities = () => {
    const mapped = sources[country.value] || [];
    const list = mapped.length ? mapped : directorySources;
    authority.innerHTML = ''; authority.value='';
    const first=document.createElement('option'); first.value=''; first.textContent='Select authority / source directory'; authority.appendChild(first);
    list.forEach(([name,focus,url])=>{
      const o=document.createElement('option');
      o.value=name;
      o.textContent=mapped.length?name:'Discovery directory — '+name;
      o.dataset.focus=focus;
      o.dataset.url=url;
      o.dataset.sourceKind=mapped.length?'country-source':'discovery-directory';
      authority.appendChild(o);
    });
    authorityOptions=Array.from(authority.options).slice(1).map(o=>({value:o.value,text:o.textContent,focus:o.dataset.focus,url:o.dataset.url,sourceKind:o.dataset.sourceKind}));
    filterSelect(authority,authorityOptions,authoritySearch.value,'Select authority / source directory');
    updateSourceLink();
    const help=root.querySelector('#rcw-authority-help');
    if(mapped.length){
      help.textContent='Country-specific official starting points are listed for '+country.value+'. Confirm the instrument, legal status, applicability and amendments on the issuing authority’s own website; this list is not a complete legal register.';
    } else {
      help.textContent='A verified country-specific authority mapping has not yet been curated for '+(country.value||'this jurisdiction')+'. The options below are discovery directories only—not the local regulator—and do not establish legal coverage. Use them to identify the competent authority, then record its official instrument URL above.';
    }
    renderEvidence();
  };
  const updateSourceLink = () => {
    const selected=authority.selectedOptions[0], url=selected&&selected.dataset.url?selected.dataset.url:'';
    const discovery=selected&&selected.dataset.sourceKind==='discovery-directory';
    openSource.href=url||'#'; openSource.setAttribute('aria-disabled',url?'false':'true');
    openSource.style.pointerEvents=url?'auto':'none'; openSource.style.opacity=url?'1':'.55';
    openSource.textContent=url?(discovery?'Open selected discovery directory ↗':'Open selected official starting point ↗'):'Select an authority to open its source';
  };
  authoritySearch.addEventListener('input',()=>{filterSelect(authority,authorityOptions,authoritySearch.value,'Select authority / source directory');if(!authority.value)sourceUrl.value='';updateSourceLink();});
  const recordArray = () => country.value==='Bangladesh' ? bdCirculars.concat(bdLetters).map(r=>({date:r[0],number:r[1],scope:r[2],title:r[3],url:r[4],verification:r[5]})) : [];
  const renderEvidence = () => {
    const arr=recordArray();
    const q=(root.querySelector('#rcw-record-search').value||'').toLowerCase();
    const filtered=arr.filter(r=>[r.date,r.number,r.scope,r.title,r.verification].join(' ').toLowerCase().includes(q));
    evidenceTable.innerHTML='';
    if(!filtered.length){const tr=document.createElement('tr'); const td=document.createElement('td');td.colSpan=5;td.textContent=arr.length?'No matching records.':'No preloaded instrument register for this jurisdiction. Add the official reference in the form above; coverage listing is not proof of a complete register.';tr.appendChild(td);evidenceTable.appendChild(tr);return;}
    filtered.forEach(r=>{const tr=document.createElement('tr');[r.date,r.number,r.scope,r.verification].forEach(v=>{const td=document.createElement('td');td.textContent=v||'Not stated';tr.appendChild(td);});const td=document.createElement('td');if(r.url){const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Official document';td.appendChild(a);}else{td.textContent='Catalogue only';}tr.appendChild(td);evidenceTable.appendChild(tr);});
  };
  const sampleProduct = root.querySelector('#rcw-sample-product');
  const sampleCase = root.querySelector('#rcw-sample-case');
  const sampleTemplates = {
    wallet: {
      title: 'Illustrative case — Digital wallet / e-money',
      question: 'Can the proposed wallet onboarding, stored-value model, agent network, transfers and customer-fund safeguarding operate lawfully and safely in the selected jurisdiction?',
      facts: 'Hypothetical product: a mobile wallet for low-value payments and domestic transfers, with optional cash-in/cash-out through agents. No real customer or transaction data is used.',
      gaps: 'Confirm whether the model requires a payment, e-money, stored-value or other licence; verify safeguarding / trust-account rules, AML/CFT risk controls, agent oversight, limits, disclosures, complaints, fraud reimbursement and incident reporting from current official sources.',
      follow: 'Map the product flow; identify the competent regulator; verify the current rulebook and licence perimeter; test fee disclosures and account recovery with intended users; assign owners and due dates.'
    },
    bank: {
      title: 'Illustrative case — Digital bank',
      question: 'What permissions, prudential controls and customer safeguards are required before launching a fully digital deposit-taking bank?',
      facts: 'Hypothetical digital-first bank offering remote onboarding, deposits, transfers, debit-card access and app-based customer support. This is a learning scenario, not a claim about a real institution.',
      gaps: 'Verify banking licence eligibility, capital and governance requirements, fit-and-proper tests, outsourcing/cloud controls, cyber resilience, operational continuity, deposit protection, AML/CFT, identity verification, complaint handling and applicable reporting duties.',
      follow: 'Create a regulator-confirmed licensing checklist; map end-to-end customer journeys; test business continuity and recovery; evidence board oversight; document open legal questions before launch approval.'
    },
    psp: {
      title: 'Illustrative case — Payment Service Provider (PSP)',
      question: 'How should a PSP establish a controlled launch for merchant acquiring, payment initiation or payment processing in this jurisdiction?',
      facts: 'Hypothetical PSP connecting merchants, customers and financial institutions. The exact legal classification depends on the services, funds flow and local law.',
      gaps: 'Confirm authorisation / registration category, settlement and safeguarding model, outsourcing and scheme obligations, AML/CFT responsibilities, fraud monitoring, dispute handling, chargebacks, data protection, incident notification and consumer disclosures.',
      follow: 'Draw the funds and data flows; ask the regulator to confirm the perimeter where ambiguous; document merchant due diligence, reconciliation, dispute SLAs, fraud escalation and outage procedures.'
    }
  };
  const renderSampleCase = () => {
    if (!sampleCase || !sampleProduct) return;
    const t = sampleTemplates[sampleProduct.value] || sampleTemplates.wallet;
    const jurisdiction = country.value || 'Select a jurisdiction';
    const mapped = sources[country.value] || [];
    const authorityHint = mapped.length ? mapped.map(x=>x[0]).slice(0,3).join(' · ') : 'Use the regulator directory above to identify the competent local authority';
    sampleCase.innerHTML = '<h3>'+esc(t.title)+'</h3><p><strong>Jurisdiction:</strong> '+esc(jurisdiction)+'</p><p><strong>Regulatory starting point:</strong> '+esc(authorityHint)+'</p><p><strong>Decision question</strong><br>'+esc(t.question)+'</p><p><strong>Scenario</strong><br>'+esc(t.facts)+'</p><p><strong>Evidence gaps to test</strong><br>'+esc(t.gaps)+'</p><p><strong>Suggested next steps</strong><br>'+esc(t.follow)+'</p><p class="rcw-help">Illustrative scenario only. It does not identify a verified country-specific circular or establish legal obligations. Confirm all applicable rules on official sources.</p>';
  };
  country.addEventListener('change',()=>{sourceUrl.value='';authoritySearch.value='';renderAuthorities();renderSampleCase();});
  sampleProduct?.addEventListener('change',renderSampleCase);
  root.querySelector('#rcw-use-sample')?.addEventListener('click',()=>{
    const t=sampleTemplates[sampleProduct.value]||sampleTemplates.wallet;
    decision.value=t.question; facts.value=t.facts; limitations.value=t.gaps+' Suggested follow-up: '+t.follow;
    circularNo.value='';instrument.value='';issueDate.value='';root.querySelector('#rcw-effective-date').value='';root.querySelector('#rcw-type').value='';
    status.textContent='Illustrative case copied into the brief. Sample scenarios are not legal instruments. Select the correct source type and enter verified instrument metadata only if you have checked an official document.';
    decision.scrollIntoView({behavior:'smooth',block:'center'});
  });
  authority.addEventListener('change',()=>{const o=authority.selectedOptions[0]; if(o && o.dataset.url){sourceUrl.value=o.dataset.url;} updateSourceLink();});
  root.querySelector('#rcw-reset').addEventListener('click',()=>{
    form.reset(); countrySearch.value='';authoritySearch.value='';country.value='';root.querySelector('#rcw-type').value='';
    root.querySelector('#rcw-record-search').value='';root.querySelector('#rcw-sample-product').value='wallet';
    sourceUrl.value='';issueDate.value='';root.querySelector('#rcw-effective-date').value='';instrument.value='';circularNo.value='';
    referenceDate.value='';output.hidden=true;preview.innerHTML='';preview.dataset.report='';
    renderAuthorities();renderSampleCase();status.textContent='Form reset. Select a jurisdiction and authority to begin again.';
  });
  root.querySelector('#rcw-record-search').addEventListener('input',renderEvidence);
  root.querySelector('#rcw-fill-record').addEventListener('click',()=>{
    const match=recordArray().find(r=>r.number.toLowerCase().includes((root.querySelector('#rcw-record-search').value||'').toLowerCase()) || r.title.toLowerCase().includes((root.querySelector('#rcw-record-search').value||'').toLowerCase()));
    if(!match){status.textContent='Enter a search term matching a Bangladesh record, then select the reference manually.';return;}
    circularNo.value=match.number; issueDate.value=match.date; instrument.value=match.title; sourceUrl.value=match.url||'';
    status.textContent='Loaded register metadata. Review verification status and confirm the original source before relying on it.';
  });
  const val = el => (el.value||'').trim();
  const esc = s => String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function formatReport(report){
    const rows=report.split('\n'); let html=''; let inMeta=false; let inList=false;
    const closeList=()=>{if(inList){html+='</ul>';inList=false;}};
    rows.forEach((line)=>{
      const t=line.trim();
      if(!t){closeList();return;}
      if(t==='DRAFT — HUMAN REVIEW REQUIRED'){closeList();html+='<p class="rcw-report-status">'+esc(t)+'</p>';return;}
      if(['REPORT METADATA','DECISION OR QUESTION','FACTS / EVIDENCE SUPPLIED','AUTHORITY / TOPIC SCOPE','ASSUMPTIONS, LIMITATIONS AND OPEN QUESTIONS','EVIDENCE QUALITY GATE','DECISION SUPPORT STATUS'].includes(t)){
        closeList(); if(inMeta){html+='</tbody></table>';inMeta=false;}
        html+='<h3>'+esc(t)+'</h3>';
        if(t==='REPORT METADATA'){html+='<table class="rcw-report-table"><tbody>';inMeta=true;}
        return;
      }
      if(inMeta && t.includes(': ')){
        const k=t.slice(0,t.indexOf(': ')), v=t.slice(t.indexOf(': ')+2);
        html+='<tr><th>'+esc(k)+'</th><td>'+esc(v)+'</td></tr>';return;
      }
      if(inMeta){html+='</tbody></table>';inMeta=false;}
      if(t.startsWith('- ')){if(!inList){html+='<ul>';inList=true;}html+='<li>'+esc(t.slice(2))+'</li>';return;}
      closeList();
      if(t.startsWith('Published by RegTech Nexus AI')) html+='<p class="rcw-report-attribution"><strong>'+esc(t)+'</strong></p>';
      else if(t.startsWith('Educational and decision-support')||t.startsWith('Do not enter confidential')) html+='<p class="rcw-report-footnote">'+esc(t)+'</p>';
      else if(t.includes(': ') && t.length<220){const k=t.slice(0,t.indexOf(': ')),v=t.slice(t.indexOf(': ')+2);html+='<p><strong>'+esc(k)+':</strong> '+esc(v)+'</p>';}
      else html+='<p>'+esc(t)+'</p>';
    });
    closeList();if(inMeta)html+='</tbody></table>';
    return html;
  }
  function generate(){
    const now=new Date();
    const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    const authorityName=val(authority)||'[Authority not selected]';
    const selectedSource=authority.selectedOptions[0];
    const focus=selectedSource && selectedSource.dataset.focus ? selectedSource.dataset.focus : '';
    const checked=val(referenceDate);
    const effective=val(root.querySelector('#rcw-effective-date'));
    const title=val(instrument);
    const hypothetical=/illustrative|hypothetical|not a legal instrument/i.test([title,val(facts),val(decision)].join(' '));
    const warnings=[];
    if(!checked) warnings.push('Reference date is not provided. Enter the intended reference date; this date does not itself verify the source.');
    if(checked && checked>today) warnings.push('Reference date is in the future relative to report preparation; confirm or correct it.');
    if(issueDate.value && issueDate.value>today) warnings.push('Issue/publication date is after the report preparation date; verify whether this is a proposed/forthcoming instrument or a date-entry error.');
    if(issueDate.value && effective && effective<issueDate.value) warnings.push('Effective date precedes issue/publication date; review the source because retrospective effect may be possible but must not be assumed.');
    let sourceHost='';
    try { sourceHost=val(sourceUrl) ? new URL(val(sourceUrl)).hostname.toLowerCase() : ''; } catch(e) { warnings.push('Source URL is not a valid absolute URL; verify it manually.'); }
    const authorityKey=authorityName.toLowerCase();
    const stripWww = host => String(host || '').toLowerCase().startsWith('www.') ? String(host).slice(4).toLowerCase() : String(host || '').toLowerCase();
    let expectedHost='';
    try {
      const selectedUrl=selectedSource && selectedSource.dataset.url ? new URL(selectedSource.dataset.url) : null;
      expectedHost=selectedUrl ? stripWww(selectedUrl.hostname) : '';
    } catch(e) { expectedHost=''; }
    const normalHost=stripWww(sourceHost);
    const domainMatches=Boolean(normalHost && expectedHost &&
      (normalHost===expectedHost || normalHost.endsWith('.'+expectedHost)));
    if(sourceHost && expectedHost && !domainMatches) warnings.push('Source domain does not match the selected authority’s mapped official starting point; mark source as UNVERIFIED until the exact official document is confirmed.');
    if(sourceHost && !expectedHost) warnings.push('No mapped official domain is available for the selected authority; manually verify the domain and exact document against an authoritative source.');
    if(!sourceHost) warnings.push('No source URL supplied; primary-source verification is outstanding.');
    if(sourceHost && !hypothetical) {
      try {
        const parsedSource=new URL(val(sourceUrl));
        if(!parsedSource.pathname || parsedSource.pathname==='/') warnings.push('Source URL appears to be a general homepage, not the exact instrument; replace it with the specific circular, rule or document URL.');
      } catch(e) {}
    }
    if(!hypothetical) {
      warnings.push('The reference date is user-entered and does not itself prove that the source or current legal status was verified.');
      if(!title) warnings.push('Instrument title is missing; the exact regulatory instrument has not been identified.');
      if(!val(circularNo)) warnings.push('Instrument / circular reference number is missing; confirm whether the document has an official identifier.');
      if(!val(issueDate)) warnings.push('Issue / publication date is missing or unverified.');
      if(!effective) warnings.push('Effective date is not recorded; confirm the instrument’s commencement provision or document why it is not applicable.');
      if(!val(decision)) warnings.push('Decision question is missing; applicability and relevance cannot yet be assessed.');
      if(!val(facts)) warnings.push('No supporting facts or evidence supplied; no substantive conclusion can be drawn.');
      if(!val(limitations)) warnings.push('Limitations are not recorded; identify missing evidence, status checks, scope and applicability questions.');
    }
    if(hypothetical) warnings.push('ILLUSTRATIVE SCENARIO — no legal instrument is cited. Instrument metadata is marked N/A and must not be read as a verified regulatory citation.');
    const instrumentMetadata = hypothetical ? {
      authority:'N/A — illustrative scenario; no instrument cited',
      type:'N/A — no legal instrument cited',
      number:'N/A — no instrument cited',
      issue:'N/A — no instrument cited',
      effective:'N/A — no instrument cited',
      title:'N/A — no instrument cited',
      source:'N/A — no instrument cited'
    } : {
      authority:authorityName,
      type:val(root.querySelector('#rcw-type'))||'[Not provided]',
      number:val(circularNo)||'[Not stated / not provided]',
      issue:val(issueDate)||'[Not provided]',
      effective:effective||'[Not stated / not provided]',
      title:title||'[Not provided]',
      source:val(sourceUrl)||'[Not provided]'
    };
    const lines=[
      'REGTECH NEXUS AI — FINTECH REGULATORY EVIDENCE BRIEF',
      'DRAFT — HUMAN REVIEW REQUIRED',
      '',
      'REPORT METADATA',
      'Prepared on: '+today,
      'Reference date (user-entered; verification not confirmed): '+(hypothetical?'N/A — illustrative scenario; no verification claimed':(checked||'[Not provided]')),
      'Jurisdiction: '+(val(country)||'[Not provided]'),
      'Issuing authority / source body: '+instrumentMetadata.authority,
      'Instrument type: '+instrumentMetadata.type,
      'Circular / reference number: '+instrumentMetadata.number,
      'Issue / publication date: '+instrumentMetadata.issue,
      'Effective date: '+instrumentMetadata.effective,
      'Instrument title: '+instrumentMetadata.title,
      'Official source URL: '+instrumentMetadata.source,
      '',
      ...(warnings.length?['VALIDATION WARNINGS',...warnings.map(w=>'- '+w),'']:[]),
      'DECISION OR QUESTION',
      val(decision)||'[Not provided — evidence or input required]',
      '',
      'FACTS / EVIDENCE SUPPLIED',
      val(facts)||'[No evidence supplied]',
      '',
      'AUTHORITY / TOPIC SCOPE',
      focus||'[Confirm the authority’s mandate and applicable scope from official sources.]',
      '',
      'ASSUMPTIONS, LIMITATIONS AND OPEN QUESTIONS',
      val(limitations)||'[No limitations recorded — reviewer must identify missing evidence, legal status, amendments and applicability.]',
      '',
      'EVIDENCE QUALITY GATE',
      '- Verify the exact instrument and its legal status against the original official source before relying on it.',
      '- Check publication, effective, amendment, supersession and withdrawal dates; do not assume chronology.',
      '- A matching domain is a screening signal, not proof that the exact document supports the claim.',
      '- Separate official catalogue metadata from full-text clause verification.',
      '- Do not infer applicability merely because a jurisdiction or regulator appears in a register.',
      '- Treat international standards and recommendations separately from domestic binding law.',
      '',
      'DECISION SUPPORT STATUS',
      'This brief structures supplied information and flags selected data-quality risks. It does not perform live legal research or independently establish legality. It does not provide a legal conclusion or recommendation unless evidence and analysis are explicitly supplied and reviewed by a qualified human.',
      '',
      'Published by RegTech Nexus AI — Audit & Regulatory Intelligence',
      'Educational and decision-support resource; not legal advice, regulatory approval or a compliance certification.',
      'Do not enter confidential customer, account, transaction, credential or other restricted banking data into a public-facing form.'
    ];
    const report=lines.join('\n');
    preview.dataset.report=report;
    preview.innerHTML=formatReport(report);
    output.hidden=false;
    status.textContent=warnings.length ? 'Draft generated with '+warnings.length+' validation warning(s). Resolve or document each warning and verify the exact primary source before reliance.' : 'Draft generated. Verify the exact primary source, legal status and applicability before reliance.';
    return report;
  }
  form.addEventListener('submit',e=>{e.preventDefault();generate();});
  let printFrame = null;
  const cleanupPrint = () => {
    if (printFrame) { printFrame.remove(); printFrame = null; }
  };
  root.querySelector('#rcw-print').addEventListener('click',()=>{
    if(output.hidden) generate();
    cleanupPrint();
    printFrame = document.createElement('iframe');
    printFrame.setAttribute('title','Print report');
    printFrame.style.cssText='position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;opacity:1;pointer-events:none';
    const reportText = preview.dataset.report || generate();
    const safeReport = formatReport(reportText);
    printFrame.onload = () => {
      const win = printFrame && printFrame.contentWindow;
      if (!win) return;
      win.focus();
      win.print();
      win.addEventListener('afterprint',cleanupPrint,{once:true});
    };
    printFrame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><title>RegTech Nexus AI — Decision Brief</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#172b43;font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.45}h1{font-size:17pt;color:#102d4a;border-bottom:3px solid #0b6894;padding-bottom:10pt;margin:0 0 8pt}h2{font-size:12pt}h3{font-size:11pt;color:#174d6c;margin:16pt 0 7pt;padding-bottom:4pt;border-bottom:1px solid #cbd8e3;break-after:avoid}p{margin:5pt 0;overflow-wrap:anywhere}ul{margin:4pt 0 8pt;padding-left:18pt}li{margin:3pt 0;break-inside:avoid}.rcw-report-status{font-weight:bold;color:#8a4d00;background:#fff6e5;border:1px solid #efd49b;padding:7pt}.rcw-report-table{width:100%;border-collapse:collapse;margin:5pt 0 10pt;table-layout:fixed}.rcw-report-table th,.rcw-report-table td{border:1px solid #cbd8e3;padding:6pt;text-align:left;vertical-align:top;overflow-wrap:anywhere}.rcw-report-table th{width:32%;background:#edf4f8;color:#193e58}.rcw-report-attribution{margin-top:15pt;padding-top:8pt;border-top:1px solid #cbd8e3}.rcw-report-footnote{font-size:9pt;color:#4c5e6b}tr{break-inside:avoid;page-break-inside:avoid}*{break-before:auto!important;break-after:auto!important;page-break-before:auto!important;page-break-after:auto!important}h1,h3{break-after:avoid-page}p,li{orphans:2;widows:2}</style></head><body><h1>REGTECH NEXUS AI</h1><p><strong>FinTech Regulatory Decision Intelligence Brief</strong></p>'+safeReport+'</body></html>';
    document.body.appendChild(printFrame);
  });
  window.addEventListener('afterprint',cleanupPrint);
  root.querySelector('#rcw-download').addEventListener('click',()=>{
    const report=output.hidden?generate():(preview.dataset.report||generate());
    const blob=new Blob(['\uFEFF',report],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    const base=(val(decision)||'fintech-regulatory-brief').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'fintech-regulatory-brief';
    a.href=url;a.download=base+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  renderAuthorities();
  renderSampleCase();
})();