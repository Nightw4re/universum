# Profil Horizon 26.3

Universum bude sestavovat tři cíle ze společných dat. První implementační cíl je Horizon 26.3 s Rust runtime. Vydaný Universum pro Minecraft 1.21.1 NeoForge slouží jako reference pro herní postup a chování. Před převodem zaznamenáme konkrétní distribuovaný build a porovnáme jej s pracovním checkoutem. Java NeoForge 26.3 bude další profil téhož jádra.

## Společná data a vazby na Horizon

- Jádro drží stabilní ID questů, předpoklady, odměny, materiály, překlady a pravidla odemykání. Profil určuje rozsah sestavy a mapuje pravidla na konkrétní předměty, recepty, stroje a serverové události.
- Generátor ověřuje návaznosti a dostupnost obsahu. Chybějící volitelnou větev lze vynechat po kontrole jejích odkazů. Chybějící povinný krok zastaví sestavu s úplným průchodem. Profil alfy může výslovně určit dřívější konec.
- Rust adaptér vynucuje postup na serveru. Stav hráče, převzetí odměn, claimy a stav Stargate sítě se ukládají za běhu. Přenos uložených světů nebo postupu je samostatná práce.

## Plán migrace

Hotový krok označíme `[x]` a připíšeme k němu odkaz na výsledek, pokud existuje. Blokovaný krok zůstává otevřený s uvedením závislosti.

### 1. Referenční průchod v Minecraft 1.21.1

- [ ] Dohledat přesný veřejný build Universum pro NeoForge 1.21.1. Zaznamenat manifest a rozdíly vůči checkoutu.
- [ ] V čistém survivalu ověřit tlakovou komoru, výrobu desky PneumaticCraft (PCB), první MI Basic Machine Hull, Digital Circuit a odemčení první brány. Ověřit, zda lze všechny vstupy získat před první cestou na Abydos.
- [ ] Zapsat povinné milníky, skutečné výrobní závislosti, odměny a volitelné kapitoly. Při inventuře ověřit tři skryté questy bez předpokladu a význam závislosti na kapitole Welcome.

### 2. Společné jádro, profily a první pull request

- [ ] Zavést verzovaný datový formát pro questy, úkoly, podmínky, odměny, překlady, materiály, recepty a dimenze. Zachovat mapu původních FTB ID.
- [ ] Přidat profily pro NeoForge 1.21.1, NeoForge 26.3 a Horizon 26.3. Každý určuje aktivní kapitoly, konkrétní vazby a vlastní lock závislostí.
- [ ] Převést první řetězec z referenčního vydání do společných dat. Ověřit shodu výstupu pro 1.21.1 a ukázat, že nezajištěný povinný PCB krok zastaví úplný build Horizonu.
- [ ] Ověřit validaci odkazů, cyklů, neviditelných uzlů, registrů, překladů a odměn. Na jedné volitelné větvi doložit, že její vynechání neporuší aktivní postup.
- [ ] Otevřít první pull request ze společného základu, projít změny a sloučit je do `main` přes Squash and merge.

### 3. Horizon 26.3 a Rust Stargate Journey

- [ ] Dohledat repozitář Rust portu Stargate Journey, přesný commit, licenci, stav bran a dimenzí. Zapsat závislosti a potvrdit první reprodukovatelný build.
- [ ] Vybrat a ověřit přesný podepsaný SDK, launcher, cílové platformy, toolchain a hashe zdrojových balíčků. Ověřit čistou klientskou instalaci i dedikovaný export.
- [ ] Sestavit a otestovat SMP s ochranou chunků. Sloučený port používá SDK z Nightly 22. listopadu 2026. Ověření kandidáti na mapu z auditu cílí na 20. listopadu, proto ověřit kompatibilní build mapy nebo spojitelnost jako konkrétní pár klienta a serveru. [Port SMP](https://github.com/horizon-rust/horizon-mods/pull/1431) · [Podepsaný SDK](https://github.com/horizon-rust/horizon/releases/tag/sdk-f1bb66f353cf67f2aa4665293fc75c8d91186fc7)
- [ ] Zapojit Rust adaptér pro questové události, odměny a serverový zámek brány. Ověřit uložení postupu a jednorázovou odměnu po restartu.
- [ ] Ověřit výzkum, vytáčení, průchod, návrat a obnovení adres a bran po restartu. Otestovat registrace a generování Netu, Niflheimu a Oannes. Zachovat Trinium a vlastní řetězec kapalné Naquadrie podle referenčního chování.

### 4. Veřejná alfa Horizonu

- [ ] Doložit ochranu claimů a fungující trust na dedikovaném serveru se dvěma hráči, včetně odebrání oprávnění a restartu.
- [ ] Doložit funkční minimapu i celou mapu na cílové sestavě. Změřit plynulost, rychlost načtení a dopad na paměť při srovnatelném průchodu světem.
- [ ] Vymezit poslední hratelný milník alfy. Ověřit čistou instalaci, první cestu bránou a návrat bez zásahu správce. Týmový průchod, hromadná těžba a questová kniha mohou následovat později.
- [ ] Zapojit CI a sestavit samostatný klientský balíček a dedikovaný server s ověřenými verzemi a hashi. Vydat přesně otestované artefakty po splnění předchozích podmínek.

### 5. Úplný průchod a zbývající buildy

- [ ] Na Horizonu ověřit celou povinnou technologickou trasu v survivalu. Zahrnout výrobu PCB, vlastní recepty Naquadahu, Processing Array, SPS a antimatter, Quantum Barrel a odměnu Ancient Coordinates.
- [ ] Podle dostupnosti kvalifikovat volitelné větve AE2, Industrial Foregoing a Hostile Neural Networks. Ověřit, které lze zařadit bez porušení závislostí.
- [ ] Napojit sestavu NeoForge 1.21.1 na společné jádro po prokázání shody s referenčním vydáním.
- [ ] Připravit povinné vazby a ověřit Java NeoForge 26.3 s ochranou chunků, questy a mapou. Publikovat jako CurseForge alpha vedle řady 1.21.1 po splnění odpovídajících podmínek.
- [ ] Pro všechny tři cíle ověřit samostatné buildy, verze, testy a vydávání z jedné hlavní větve.
