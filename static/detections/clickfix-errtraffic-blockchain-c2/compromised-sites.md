# Compromised sites — ErrTraffic "Analytics" cluster (July 2026 pivot)

These are **third-party victim websites** observed serving the ErrTraffic injected loader for this contract (`0x08207B08…D308`), found by pivoting the July delivery hosts through public web-scan data. They are **not** attacker-owned — notify the owners / relevant CERTs; do **not** block them as C2.

**Status key:** `LIVE` = injection marker confirmed by first-hand fetch at time of writing · `LIVE(B)` = base64+XOR variant confirmed · `PIVOT` = seen in web-scan history, not re-confirmed (a non-detection is *inconclusive* — the inject is served conditionally).

Full analysis: https://meltedinhex.com/posts/clickfix-errtraffic-blockchain-c2/


## High-confidence (64) — loaded two or more rotating hosts

A site can only serve multiple sequential delivery hosts by reading the on-chain pointer as it rotated — the signature that ties it to this contract.

| Site | Delivery hosts observed | Status |
|---|---|---|
| `aa-solutions[.]de` | kaleda[.]pro, pokese[.]pro | PIVOT |
| `abbasheartwm[.]org` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro | PIVOT |
| `acesgaragerepair[.]com` | abrmot[.]pro, kaleda[.]pro, kaloed[.]pro, marjdl[.]pro, mekasa[.]pro | PIVOT |
| `acesgaragesanjose[.]com` | kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `adiapavj[.]ro` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `alessiachloeperu.com[.]pe` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `anfconcepts[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `arthuratelier[.]com` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `autocareacademy[.]com` | abrmot[.]pro, maloke[.]pro, pokese[.]pro | PIVOT |
| `bartonspecialistclinic.com[.]au` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `boxywebtools[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `childrenhouseschool[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `comprooroediamanti[.]it` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `danacgautreaux[.]net` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `dirtbgone[.]ie` | fesold[.]com, pokese[.]pro | PIVOT |
| `drfitness[.]fit` | mekasa[.]pro, pokese[.]pro | LIVE |
| `ewbn[.]org` | kaleda[.]pro, marjdl[.]pro | PIVOT |
| `findsforher[.]com` | abrmot[.]pro, kaleda[.]pro | PIVOT |
| `finsightsconsulting[.]com` | abrmot[.]pro, kaleda[.]pro, mamkor[.]pro | PIVOT |
| `gotomariko[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `healthfood[.]zone` | abrmot[.]pro, kaleda[.]pro, mamkor[.]pro | PIVOT |
| `ikinogo[.]net` | abrmot[.]pro, fesold[.]com | PIVOT |
| `imperialroofingandgutteringltd.co[.]uk` | fesold[.]com, pokese[.]pro | LIVE |
| `infobpi[.]pl` | fesold[.]com, kaloed[.]pro | PIVOT |
| `inoxarreda[.]it` | cal.magicalegyptwomen[.]com, kaleda[.]pro, mamkor[.]pro | PIVOT |
| `itsdoctorpayne[.]com` | fesold[.]com, pokese[.]pro | PIVOT |
| `jermainelewis[.]com` | fesold[.]com, pokese[.]pro | LIVE(B) |
| `kcosmetics[.]kr` | babelo[.]pro, maloke[.]pro, marjdl[.]pro | PIVOT |
| `laguzmancontinta[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro | PIVOT |
| `londonhomeguide.co[.]uk` | abrmot[.]pro, kaleda[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `matierenews[.]com` | kaleda[.]pro, kaloed[.]pro, marjdl[.]pro | PIVOT |
| `mediaintegra.co[.]id` | abrmot[.]pro, kaloed[.]pro | PIVOT |
| `naturalnews.com[.]au` | kaloed[.]pro, mekasa[.]pro | PIVOT |
| `ocpostco[.]com` | abrmot[.]pro, fesold[.]com | PIVOT |
| `origin-al[.]org` | kaloed[.]pro, marjdl[.]pro, pokese[.]pro | PIVOT |
| `ortopediatri.com[.]tr` | abrmot[.]pro, fesold[.]com, pokese[.]pro | PIVOT |
| `populardentalcare[.]com` | abrmot[.]pro, kaleda[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `proroyalty[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro | PIVOT |
| `saisrls[.]it` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `savepeny[.]com` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `sayantanconsultants[.]com` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `shucare.com[.]au` | maloke[.]pro, marjdl[.]pro | PIVOT |
| `soccerpunter[.]org` | fesold[.]com, pokese[.]pro | LIVE |
| `teknofestdronesampiyonasi[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro | PIVOT |
| `tennistotal[.]net` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro | PIVOT |
| `thepesthunter[.]com` | abrmot[.]pro, mamkor[.]pro | PIVOT |
| `timegiftbd[.]com` | kaloed[.]pro, marjdl[.]pro | LIVE(B) |
| `turuncukentmobilyalari[.]com` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `vacante-ieftine[.]ro` | abrmot[.]pro, kaloed[.]pro | PIVOT |
| `veo3code[.]com` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `watersolutionsfl[.]com` | babelo[.]pro, maloke[.]pro, marjdl[.]pro | PIVOT |
| `weddingcarsshropshire.co[.]uk` | kaloed[.]pro, marjdl[.]pro | PIVOT |
| `wordguru[.]co` | mamkor[.]pro, marjdl[.]pro | PIVOT |
| `www.courts-on[.]fr` | fesold[.]com, pokese[.]pro | LIVE |
| `www.ironcladsportfishing[.]com` | kaleda[.]pro, marjdl[.]pro | PIVOT |
| `www.kilimanjarodreams[.]com` | abrmot[.]pro, kaleda[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `www.lmstamper[.]com` | babelo[.]pro, maloke[.]pro | LIVE(B) |
| `www.nationaltaekwondo[.]net` | kaleda[.]pro, kaloed[.]pro, marjdl[.]pro | PIVOT |
| `www.radiolacheverisima[.]com` | kaleda[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `www.radioondasdelriomayo[.]com` | kaleda[.]pro, kaloed[.]pro | LIVE |
| `www.sallyflint[.]com` | fesold[.]com, kaloed[.]pro, pokese[.]pro | PIVOT |
| `www.sbss.org[.]in` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `www.tais-costruzioni[.]it` | abrmot[.]pro, kaloed[.]pro, mamkor[.]pro, marjdl[.]pro | PIVOT |
| `zunaminds[.]org` | kaloed[.]pro, marjdl[.]pro | PIVOT |

## Single-host observations (139) — lower confidence

Seen loading one rotating host; likely same campaign but a single observation. Verify before action.

| Site | Host | Status |
|---|---|---|
| `aacharyaamanastrology[.]com` | marjdl[.]pro | PIVOT |
| `admyzer[.]in` | abrmot[.]pro | PIVOT |
| `aglimitless[.]com` | fesold[.]com | PIVOT |
| `allsportsgo[.]com` | kaleda[.]pro | PIVOT |
| `alwadannews24[.]com` | fesold[.]com | PIVOT |
| `amadviserslimited.co[.]uk` | abrmot[.]pro | PIVOT |
| `angarsk.xn----7sbbk0auidbf2b5a[.]xn--p1ai` | fesold[.]com | PIVOT |
| `annamdecor[.]vn` | maloke[.]pro | PIVOT |
| `arkwealthsolutions.com[.]au` | mekasa[.]pro | PIVOT |
| `ataleunfolds.co[.]uk` | maloke[.]pro | PIVOT |
| `autorepairpalmetto[.]com` | fesold[.]com | PIVOT |
| `balanova.co[.]uk` | abrmot[.]pro | PIVOT |
| `balorea[.]com` | fesold[.]com | LIVE(B) |
| `bhagwatibiscuits[.]com` | maloke[.]pro | PIVOT |
| `binixo.io[.]vn` | mekasa[.]pro | PIVOT |
| `blessstav[.]cz` | fesold[.]com | PIVOT |
| `bleuhaven[.]com` | fesold[.]com | PIVOT |
| `bootsontheroof[.]com` | kaleda[.]pro | PIVOT |
| `cannabis-dna[.]com` | pokese[.]pro | PIVOT |
| `capitalarena[.]pk` | mekasa[.]pro | PIVOT |
| `cashforcars-pittsburgh[.]com` | fesold[.]com | LIVE |
| `chestnutgrovecapital[.]com` | maloke[.]pro | PIVOT |
| `churchforsale[.]ca` | fesold[.]com | LIVE |
| `consolegr[.]com` | marjdl[.]pro | PIVOT |
| `crystalrosedigitallabel[.]com` | kaleda[.]pro | PIVOT |
| `deriveratreeservice[.]com` | pokese[.]pro | PIVOT |
| `dev.wirmachenkfzgutachten[.]de` | kaleda[.]pro | PIVOT |
| `diversemindsuccess[.]com` | kaleda[.]pro | PIVOT |
| `drivemama.co[.]uk` | fesold[.]com | PIVOT |
| `drnirdosh[.]com` | kaloed[.]pro | PIVOT |
| `eficienta-energetica-leonida.primariapetrosani[.]ro` | mamkor[.]pro | PIVOT |
| `environmentaldaily[.]com` | mamkor[.]pro | PIVOT |
| `executivebitesbd[.]com` | fesold[.]com | PIVOT |
| `funtoast.com[.]sg` | mekasa[.]pro | PIVOT |
| `geurtuin[.]com` | kaleda[.]pro | PIVOT |
| `groupelaporte[.]ca` | abrmot[.]pro | PIVOT |
| `groutcleaningperth.com[.]au` | maloke[.]pro | PIVOT |
| `guiasantosdumont.com[.]br` | kaleda[.]pro | PIVOT |
| `h5credit[.]top` | fesold[.]com | LIVE(B) |
| `h5locphatcredit.io[.]vn` | kaloed[.]pro | PIVOT |
| `hautetimenews[.]com` | kaloed[.]pro | PIVOT |
| `healgram[.]gr` | kaleda[.]pro | PIVOT |
| `hhhosting.co[.]uk` | fesold[.]com | PIVOT |
| `hieloazulturismoalternativo.tur[.]ar` | kaleda[.]pro | PIVOT |
| `higherphysio[.]com` | kaleda[.]pro | PIVOT |
| `honeyshine[.]pk` | mekasa[.]pro | PIVOT |
| `hotelmpocono[.]com` | fesold[.]com | PIVOT |
| `ilisdesigns[.]com` | kaleda[.]pro | PIVOT |
| `ilmuapk[.]app` | pokese[.]pro | PIVOT |
| `ilovebeaver[.]com` | kaloed[.]pro | PIVOT |
| `infocus[.]tn` | pokese[.]pro | PIVOT |
| `jerizeguesthome[.]org` | marjdl[.]pro | PIVOT |
| `joanpowerslaw[.]com` | kaloed[.]pro | PIVOT |
| `jointpainmds[.]com` | marjdl[.]pro | PIVOT |
| `kcredit.io[.]vn` | abrmot[.]pro | PIVOT |
| `kidsninjawarrior[.]com` | fesold[.]com | PIVOT |
| `koripass[.]com` | maloke[.]pro | PIVOT |
| `kristatheexplorer[.]com` | kaleda[.]pro | PIVOT |
| `kulinerindonesia.web[.]id` | kaleda[.]pro | PIVOT |
| `kutxufletos[.]com` | marjdl[.]pro | PIVOT |
| `lagrandefm[.]com` | kaleda[.]pro | PIVOT |
| `marcospitbullhome[.]com` | kaleda[.]pro | PIVOT |
| `mariasoutopsicologa[.]es` | abrmot[.]pro | PIVOT |
| `medspluscare[.]com` | abrmot[.]pro | PIVOT |
| `mietservice-minibagger[.]de` | kaleda[.]pro | PIVOT |
| `mnerealty[.]com` | abrmot[.]pro | PIVOT |
| `mrcleanandshine.co[.]uk` | mamkor[.]pro | PIVOT |
| `mx-df[.]net` | kaleda[.]pro | PIVOT |
| `nondor.g6[.]cz` | fesold[.]com | PIVOT |
| `notarymatrixinc[.]com` | kaloed[.]pro | PIVOT |
| `novedadesgt[.]com` | kaloed[.]pro | PIVOT |
| `operacionreciclaje.sigfito[.]es` | fesold[.]com | LIVE(B) |
| `pacificlogistic[.]eu` | fesold[.]com | PIVOT |
| `pakaims.edu[.]pk` | fesold[.]com | PIVOT |
| `pgatbu.com[.]ng` | mekasa[.]pro | PIVOT |
| `phoenixhandmade[.]hu` | maloke[.]pro | PIVOT |
| `piranti-catering[.]com` | fesold[.]com | PIVOT |
| `pmsons[.]com` | kaleda[.]pro | PIVOT |
| `polnews24[.]eu` | abrmot[.]pro | PIVOT |
| `promofordiscount[.]com` | fesold[.]com | PIVOT |
| `rahalgold.com[.]tr` | kaleda[.]pro | PIVOT |
| `rankandtrack[.]com` | pokese[.]pro | PIVOT |
| `ransin32.dream[.]press` | kaleda[.]pro | PIVOT |
| `rockledgemovers[.]com` | fesold[.]com | PIVOT |
| `salek[.]ae` | abrmot[.]pro | PIVOT |
| `sergemoulypeintre[.]fr` | kaloed[.]pro | PIVOT |
| `silverbackchatbot[.]com` | marjdl[.]pro | PIVOT |
| `smashclubburgers[.]com` | pokese[.]pro | PIVOT |
| `snapchatplanets[.]io` | maloke[.]pro | PIVOT |
| `sourcetrace[.]com` | mekasa[.]pro | PIVOT |
| `spytoshi[.]com` | abrmot[.]pro | PIVOT |
| `sqsurveyors[.]com` | marjdl[.]pro | PIVOT |
| `stroycenter[.]net` | kaleda[.]pro | PIVOT |
| `sunnahersopan[.]com` | kaloed[.]pro | PIVOT |
| `swanriverschool[.]org` | kaleda[.]pro | PIVOT |
| `tcwaremmien[.]be` | maloke[.]pro | PIVOT |
| `tecnoibrid[.]com` | mamkor[.]pro | PIVOT |
| `themosaicinstitute[.]com` | kaloed[.]pro | PIVOT |
| `therecipesphere[.]com` | abrmot[.]pro | PIVOT |
| `thetempleofetienne[.]com` | kaleda[.]pro | PIVOT |
| `topbeautytrainingcollege[.]com` | fesold[.]com | LIVE |
| `triangleadvocacia[.]es` | kaloed[.]pro | PIVOT |
| `uniaocasings.com[.]br` | abrmot[.]pro | PIVOT |
| `unspanel[.]rs` | marjdl[.]pro | PIVOT |
| `valonmarketplace[.]com` | fesold[.]com | PIVOT |
| `vehicleshipping[.]net` | kaloed[.]pro | PIVOT |
| `villacamarao.com[.]br` | fesold[.]com | PIVOT |
| `vinabeautyspa[.]nyc` | fesold[.]com | PIVOT |
| `viralbet777[.]co` | mekasa[.]pro | PIVOT |
| `webcms.central.edu[.]gh` | kaleda[.]pro | PIVOT |
| `whocanroastthemost[.]com` | kaleda[.]pro | PIVOT |
| `worldneonatology[.]com` | mamkor[.]pro | PIVOT |
| `www.altecva[.]com` | maloke[.]pro | PIVOT |
| `www.alumnofprojects.co[.]il` | kaleda[.]pro | PIVOT |
| `www.amazonia-navigators[.]ro` | fesold[.]com | PIVOT |
| `www.atrafen[.]com` | fesold[.]com | PIVOT |
| `www.befrankphotos[.]com` | abrmot[.]pro | PIVOT |
| `www.capegranite.co[.]za` | maloke[.]pro | PIVOT |
| `www.costa-blanca-apartment[.]com` | abrmot[.]pro | PIVOT |
| `www.creoletutors[.]com` | abrmot[.]pro | PIVOT |
| `www.hijaztravel.co[.]uk` | pokese[.]pro | PIVOT |
| `www.hireloft[.]ca` | pokese[.]pro | PIVOT |
| `www.home-insurance.co[.]il` | maloke[.]pro | PIVOT |
| `www.italmix[.]net` | abrmot[.]pro | PIVOT |
| `www.kewsrs.com[.]au` | kaloed[.]pro | PIVOT |
| `www.lifetimeeyecare[.]biz` | fesold[.]com | PIVOT |
| `www.montanaranchrental[.]com` | fesold[.]com | LIVE |
| `www.namathejaljawdah[.]com` | kaleda[.]pro | PIVOT |
| `www.radiozona94fm[.]com` | kaleda[.]pro | PIVOT |
| `www.ronaldotech[.]com` | fesold[.]com | LIVE(B) |
| `www.rssssociety.org[.]in` | fesold[.]com | LIVE |
| `www.safespacesouthwest[.]com` | kaleda[.]pro | PIVOT |
| `www.skuteczneafirmacje[.]com` | maloke[.]pro | PIVOT |
| `www.threepublic[.]com` | kaleda[.]pro | PIVOT |
| `www.tuttoinriviera[.]com` | fesold[.]com | PIVOT |
| `www.vecte-algerie[.]com` | marjdl[.]pro | PIVOT |
| `www.yetundemedia[.]ug` | fesold[.]com | LIVE(B) |
| `zaprorenovation[.]ca` | fesold[.]com | LIVE(B) |
| `zofianatra[.]com` | kaleda[.]pro | PIVOT |
