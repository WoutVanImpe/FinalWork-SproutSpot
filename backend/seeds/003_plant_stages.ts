import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	await knex("plant_stages").del();

	const stages = [
		// 1. Munt (Totaal: 60 dagen)
		{
			plant_id: 1,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste groene puntjes van de muntplant komen boven de grond uit.",
			requirements: JSON.stringify({ light: "Indirect zonlicht", water: "Licht vochtig houden" }),
			instructions: JSON.stringify([
				"Houd de aarde steeds een beetje vochtig, maar niet kletsnat. Je kunt het beste elke dag even voelen of de bovenkant nog nat is.",
				"Zet de pot op een warme plek waar licht komt, maar niet in de felle zon. Een vensterbank op het noorden of oosten is perfect. Dan droogt de grond niet te snel uit."
			]),
		},
		{
			plant_id: 1,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing heeft nu meerdere kleine, gekartelde muntblaadjes ontwikkeld.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef pas water als de bovenkant van de aarde droog aanvoelt. Steek er gerust je vinger even in om te voelen, als het tot aan je vingertop droog is, mag er water bij.",
				"Als er heel veel plantjes dicht op elkaar staan, kun je de zwakste er voorzichtig uittrekken. Zo krijgen de sterkere plantjes meer ruimte om te groeien."
			]),
		},
		{
			plant_id: 1,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant is veranderd in een bossig struikje met een sterke muntgeur.",
			requirements: JSON.stringify({ light: "Halfschaduw tot zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip af en toe de bovenkant van de stengels af, net boven een plek waar twee blaadjes uit elkaar groeien. Dan gaat de plant mooi vertakken en wordt hij lekker vol en bossig.",
				"Zorg dat de aarde nooit helemaal kurkdroog wordt. Munt houdt van een beetje vocht, maar pas op dat de pot niet onder water staat."
			]),
		},
		{
			plant_id: 1,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 16,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De munttakken zijn lang genoeg en klaar om doorlopend geknipt te worden.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de stengels af vlak boven een plek waar twee blaadjes uit elkaar groeien. Dan loopt de plant meteen weer uit en kun je blijven oogsten. Hoe vaker je knipt, hoe voller hij wordt."
			]),
		},

		// 2. Tijm (Totaal: 80 dagen)
		{
			plant_id: 2,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Zeer fijne, kleine groene kiemblaadjes worden zichtbaar.",
			requirements: JSON.stringify({ light: "Licht en warm", water: "Licht vochtig" }),
			instructions: JSON.stringify([
				"Dek de zaadjes nauwelijks af met aarde. Tijm heeft licht nodig om te kunnen ontkiemen, dus een heel dun laagje is genoeg.",
				"Sproei voorzichtig water met een plantenspuit in plaats van een gieter. Zo spoelen de piepkleine zaadjes niet weg."
			]),
		},
		{
			plant_id: 2,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De dunne zaailingen beginnen stevigere, houtachtige mini-takjes te vormen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Laat de aarde tussen het water geven door een beetje opdrogen. Tijm komt uit het Middellandse Zeegebied en houdt niet van natte voeten.",
				"Zet de plantjes op de zonnigste plek die je hebt. Hoe meer zon, hoe beter de tijm gaat groeien."
			]),
		},
		{
			plant_id: 2,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 30, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De tijm vormt een compact, klein struikje vol met aromatische naaldblaadjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Pas op met water geven. Tijm houdt van droge voeten en kan makkelijk doodgaan als je te veel water geeft. Wacht tot de aarde helemaal droog is voordat je weer water geeft.",
				"Tijm heeft geen extra meststoffen nodig. Hij groeit van nature op arme, rotsachtige grond."
			]),
		},
		{
			plant_id: 2,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 30, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het struikje is volwassen en de takjes kunnen geoogst worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Knip takjes af naar behoefte, maar knip niet tot in het oude, kale hout. Daar groeien geen nieuwe blaadjes meer aan. Knip dus altijd boven een plek waar nog groene blaadjes zitten."
			]),
		},

		// 3. Rozemarijn (Totaal: 90 dagen)
		{
			plant_id: 3,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Na een lange periode komen de eerste naaldachtige kiemen tevoorschijn.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Licht vochtig" }),
			instructions: JSON.stringify([
				"Wees geduldig! Rozemarijn heeft tijd nodig om te ontkiemen, het kan wel een maand duren voordat je iets ziet. Geef niet op.",
				"Zorg dat de temperatuur rond de 20�C blijft en dat de aarde niet uitdroogt. Een warme, lichte plek binnenshuis werkt het beste."
			]),
		},
		{
			plant_id: 3,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 30, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt duidelijke, stevige, opgaande naaldblaadjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Verpot de zaailingen naar een pot met goed doorlatende grond. Gewone potgrond met een beetje zand erdoor is ideaal, dan blijft de grond luchtig.",
				"Zet de potjes nu in de volle zon. Rozemarijn is een echte zonaanbidder."
			]),
		},
		{
			plant_id: 3,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 30, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er heeft zich een klein, houtachtig mediterraan struikje gevormd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Geef pas water als de aarde dieper in de pot droog aanvoelt. Steek je vinger tot aan de tweede knuckle in de grond. Als het daar nog vochtig is, wacht dan nog even met water geven.",
				"Zet de rozemarijn op een zonnige plek buiten tijdens warme zomerdagen. Dat vindt hij heerlijk!"
			]),
		},
		{
			plant_id: 3,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 30, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De rozemarijntakken zijn stevig en klaar om geplukt te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Knip de jonge toppen van de takjes voor de beste smaak. Die zijn het malsst en het meest aromatisch. Oude takken worden houtachtig, die kun je beter laten zitten."
			]),
		},

		// 4. Bieslook (Totaal: 65 dagen)
		{
			plant_id: 4,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bieslook komt op als dunne, dubbelgevouwen groene grassprietjes.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de aarde goed vochtig. Bieslook lust graag water, zeker in het begin.",
				"Plaats de pot op een lichte vensterbank. Bieslook groeit het beste met veel licht, maar niet in de brandende zon."
			]),
		},
		{
			plant_id: 4,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De sprieten richten zich op en beginnen plukjes te vormen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef water aan de basis van de sprietjes, niet eroverheen. Zo blijven ze mooi rechtop staan.",
				"Als de sprieten heel snel omhoog schieten en slap worden, staat de plant te warm. Zet hem dan op een koelere plek."
			]),
		},
		{
			plant_id: 4,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er staat een mooie, dichte pol met holle, stevige bieslooksprieten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, vooral als de plant binnen staat. Bieslook wordt het mooist als hij genoeg vocht krijgt.",
				"Als er bloemknoppen verschijnen, kun je die beter weghalen. Dan blijft de plant nieuwe sprieten maken in plaats van zaadjes."
			]),
		},
		{
			plant_id: 4,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bieslookpol is volgroeid en klaar voor consumptie.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de sprieten een paar centimeter boven de grond af. Laat zeker 2 tot 3 cm staan. De pol loopt vanzelf weer uit en je kunt wekenlang blijven oogsten."
			]),
		},

		// 5. Basilicum (Totaal: 45 dagen)
		{
			plant_id: 5,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine ronde kiemblaadjes vouwen zich open.",
			requirements: JSON.stringify({ light: "Indirect zonlicht", water: "Vochtig houden" }),
			instructions: JSON.stringify([
				"Dek de zaadjes niet of nauwelijks af met aarde. Basilicum heeft licht nodig om te ontkiemen, dus een heel fijn laagje is genoeg.",
				"Houd de aarde warm en goed vochtig. Basilicum komt uit warme landen en houdt van een temperatuur rond de 22�C. Een dekentje van plasticfolie over de pot helpt om de warmte vast te houden."
			]),
		},
		{
			plant_id: 5,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste set echte, glanzende basilicumblaadjes is gevormd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Geef water op de aarde, niet over de blaadjes heen. Als de blaadjes nat worden, kunnen er schimmels op komen.",
				"Zet de plant op de warmste, zonnigste plek die je hebt. Basilicum is een echte zonliefhebber."
			]),
		},
		{
			plant_id: 5,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant groeit uit tot een bossige plant met grote, geurende bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de bovenkant van de stengels af, net boven een plek waar twee blaadjes uit elkaar groeien. Dan gaat de plant vertakken en wordt hij mooi vol en bossig.",
				"Als je bloemknopjes ziet, knijp ze dan meteen weg. Basilicum die gaat bloeien, stopt met het maken van nieuwe blaadjes."
			]),
		},
		{
			plant_id: 5,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er kan doorlopend geoogst worden van deze volle basilicumplant.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Pluk geen losse blaadjes maar knip hele takjes af, vlak boven een paar blaadjes. Dan groeit de plant steeds weer door en kun je er maanden van genieten."
			]),
		},

		// 6. Kerstomaatjes (Totaal: 85 dagen)
		{
			plant_id: 6,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine tomatenkiemen met langwerpige blaadjes zijn opgekomen.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de aarde warm (rond 20-22�C) en vochtig. Tomaten houden van warmte, dus een plekje boven de verwarming of in een warme kamer is ideaal.",
				"Zodra de eerste groene puntjes boven de grond komen, hebben ze meteen licht nodig. Zet ze dan direct op een lichte plek."
			]),
		},
		{
			plant_id: 6,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing heeft stevige, diep ingesneden echte tomatenbladeren.",
			requirements: JSON.stringify({ light: "Gedeeltelijke zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de plantjes naar een diepe pot zodra ze 4 blaadjes hebben. Tomaten maken lange wortels, dus hoe dieper de pot, hoe beter.",
				"Geef water zodra de grond droog aanvoelt. Steek je vinger in de aarde om het te controleren."
			]),
		},
		{
			plant_id: 6,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De tomatenplant groeit krachtig omhoog met veel bladstengels.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Plaats een stok of een klein klimrek in de pot. Tomatenplanten worden hoog en hebben steun nodig om niet om te vallen.",
				"Haal elke week de kleine scheutjes weg die in de oksels van de bladeren groeien, tussen de stam en een blad. Dit heet dieven. Door te dieven stopt de plant al zijn energie in de tomaatjes, niet in extra bladeren."
			]),
		},
		{
			plant_id: 6,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant schiet omhoog en de eerste trossen bloemknoppen vormen zich.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef elke dag een beetje water, liever elke dag een klein beetje dan af en toe heel veel. Als de plant plotseling veel water krijgt, kunnen de tomaatjes later barsten.",
				"Begin nu met het geven van speciale tomatenvoeding (te koop bij het tuincentrum). E�n keer per week is genoeg."
			]),
		},
		{
			plant_id: 6,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine gele bloemetjes hebben zich geopend aan de trossen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Tik zachtjes tegen de bloemetjes of schud de plant een beetje. Tomaten bestuiven zichzelf, maar een klein handje helpt het stuifmeel verspreiden."
			]),
		},
		{
			plant_id: 6,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste trossen met felrode, sappige kerstomaatjes zijn rijp.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Pluk de tomaatjes als ze egaal rood zijn en een beetje meegeven als je er zachtjes in knijpt. Hoe roder, hoe zoeter!"
			]),
		},

		// 7. Komkommer (Totaal: 70 dagen)
		{
			plant_id: 7,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 5,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, krachtige kiembladen breken razendsnel door de grond.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Komkommers hebben veel warmte nodig om te ontkiemen, rond de 22�C is ideaal. Een warme vensterbank boven de verwarming werkt goed.",
				"Houd de aarde constant een beetje vochtig, maar zorg dat er geen laagje water onder in de pot blijft staan."
			]),
		},
		{
			plant_id: 7,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing maakt grote, ruwe, hartvormige bladeren aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Wees voorzichtig met verpotten. De wortels van komkommers zijn erg gevoelig en breken snel. Gebruik een kluit aarde om de wortels heen.",
				"Geef lauwwarm water aan de basis van de plant. Koud water kan de plant laten schrikken."
			]),
		},
		{
			plant_id: 7,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant ontwikkelt ranken en zoekt naar klimsteun.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Leid de stengel voorzichtig langs een touwtje of klimrek omhoog. Komkommers willen graag klimmen.",
				"Geef elke week een beetje vloeibare plantenvoeding. Komkommers groeien snel en hebben veel energie nodig."
			]),
		},
		{
			plant_id: 7,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant groeit meterslang en maakt overal bloemknoppen aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Knip de zijscheuten na het eerste blad weg. Zo voorkom je dat de plant een enorme wildernis wordt en blijven de komkommers mooi.",
				"Houd de grond constant een beetje nat. Komkommers bestaan voor een groot deel uit water en hebben dus veel vocht nodig."
			]),
		},
		{
			plant_id: 7,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Gele bloemen verschijnen, met daarachter al een mini-komkommertje.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Als je binnen kweekt, kun je de bloemetjes zelf bestuiven met een zacht penseeltje. Ga van bloemetje naar bloemetje alsof je een bijtje bent."
			]),
		},
		{
			plant_id: 7,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Mooie, egale, groen glanzende komkommers zijn klaar om geplukt te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de komkommer los met een scherp mesje zodra hij mooi egaal groen is. Wacht niet te lang, want als de schil dof of geel wordt, is hij overrijp."
			]),
		},

		// 8. Spinazie (Totaal: 45 dagen)
		{
			plant_id: 8,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Smal uitgerekte kiemblaadjes verschijnen in rijen.",
			requirements: JSON.stringify({ light: "Licht", water: "Goed vochtig" }),
			instructions: JSON.stringify([
				"Zaai spinazie direct in een diepe bak of buiten in de grond. Spinazie houdt niet van verpotten.",
				"Houd de grond goed nat. Spinazie houdt van koelte en vocht, dus geef gerust elke dag een beetje water."
			]),
		},
		{
			plant_id: 8,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De kenmerkende, malse, driehoekige spinaziebladeren worden gevormd.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de plantjes uit tot ze 5 tot 10 cm uit elkaar staan. Zo krijgen ze genoeg ruimte om mooie grote bladeren te maken."
			]),
		},
		{
			plant_id: 8,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een volle rozet met malse, donkergroene bladeren staat klaar.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef bij warm weer extra water. Als spinazie het te warm en te droog krijgt, gaat hij snel bloeien en worden de bladeren bitter."
			]),
		},
		{
			plant_id: 8,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 5, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bladeren zijn groot genoeg om gegeten te worden.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de buitenste bladeren weg en laat het hartje staan. Dan groeit de plant gewoon door en kun je wel 3 of 4 keer oogsten van dezelfde plant."
			]),
		},

		// 9. Courgette (Totaal: 55 dagen)
		{
			plant_id: 9,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Enorme, dikke kiembladen komen krachtig opzetten.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Leg de grote zaden op hun zijkant in de aarde. Als je ze plat legt, kunnen ze gaan rotten voordat ze ontkiemen.",
				"Houd de aarde lekker warm. Courgettes komen uit warme gebieden en ontkiemen het beste bij temperaturen rond de 22�C."
			]),
		},
		{
			plant_id: 9,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing krijgt grote, behaarde bladeren met gekartelde randen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de courgette naar een grote pot of zet hem buiten in de volle grond. Courgettes worden enorm en hebben veel ruimte nodig."
			]),
		},
		{
			plant_id: 9,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant is veranderd in een gigantische, uitwaaierende bladplant.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef water aan de basis van de plant, niet over de bladeren heen. De reusachtige bladeren houden het water vast, waardoor schimmels kunnen ontstaan."
			]),
		},
		{
			plant_id: 9,
			stage_name: "Bloei",
			stage_order: 4,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 28, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, felle oranje-gele bloemen openen zich onder het blad.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Je kunt het verschil zien tussen mannelijke en vrouwelijke bloemen: vrouwelijke bloemen hebben een dik bolletje, de toekomstige courgette, achter de bloem."
			]),
		},
		{
			plant_id: 9,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 26, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste jonge, glanzende courgettes liggen klaar onder de bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Oogst de courgettes als ze ongeveer 15 tot 20 cm lang zijn. Hoe vaker je oogst, hoe meer nieuwe courgettes de plant maakt. Laat ze niet te groot worden, dan zijn ze het lekkerst."
			]),
		},

		// 10. Wortel (Totaal: 80 dagen)
		{
			plant_id: 10,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Fijne sprietjes met vederlichte miniblaadjes komen op.",
			requirements: JSON.stringify({ light: "Licht", water: "Constant vochtig" }),
			instructions: JSON.stringify([
				"Zaai wortels altijd direct op de plek waar ze moeten groeien. Als je ze verpot, krijgen ze kromme, misvormde wortels.",
				"Houd de bovenkant van de aarde steeds vochtig. Wortels ontkiemen het beste als de grond nooit uitdroogt."
			]),
		},
		{
			plant_id: 10,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof begint nu flink te groeien en lijkt op peterselie.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de worteltjes voorzichtig uit. Als ze te dicht op elkaar staan, krijgen ze geen ruimte om dikke wortels te maken. Trek de kleinste plantjes er voorzichtig uit."
			]),
		},
		{
			plant_id: 10,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er staat een weelderige bos groen loof; ondergronds zwelt de wortel aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Geef liever ��n keer per week veel water dan elke dag een beetje. Diep water geven zorgt dat de wortel diep de grond in groeit op zoek naar water."
			]),
		},
		{
			plant_id: 10,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bovenkant van de oranje wortel steekt net boven de grond uit.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Pak het loof stevig vast bij de basis en trek de wortel er met een draaiende beweging uit. Als de grond een beetje vochtig is, gaat dit het gemakkelijkst."
			]),
		},
		

		// 11. Radijs (Totaal: 30 dagen)
		{
			plant_id: 11,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 4,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Binnen een paar dagen staan de hartvormige kiemblaadjes al fier overeind.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de grond vanaf de eerste dag steeds een beetje vochtig. Radijs groeit supersnel en heeft direct water nodig.",
				"Zaai direct in de pot of in de volle grond. Radijsjes kun je het beste niet verpotten."
			]),
		},
		{
			plant_id: 11,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 6,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen maken hun eerste echte ruwe bladeren aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de radijsjes meteen uit tot 5 cm afstand. Als ze te dicht op elkaar staan, maken ze geen mooie ronde knolletjes."
			]),
		},
		{
			plant_id: 11,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Onder de bladeren zwelt een felrood bolletje razendsnel op.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zorg dat de grond nooit uitdroogt. Als radijsjes te weinig water krijgen, worden ze heel scherp van smaak en taai van structuur."
			]),
		},
		{
			plant_id: 11,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Prachtige, ronde rode radijsknolletjes zijn perfect ontwikkeld.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Trek de radijsjes op tijd uit de grond. Als ze te lang blijven zitten, worden ze houtachtig en minder lekker. Het formaat van een knikker is perfect."
			]),
		},

		// 12. Broccoli (Totaal: 80 dagen)
		{
			plant_id: 12,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Stevige koolkiemen komen gelijkmatig op.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de grond vochtig en koel. Broccoli is een koolsoort en houdt niet van extreme hitte. Een plekje uit de felle zon is in het begin beter."
			]),
		},
		{
			plant_id: 12,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing heeft nu een aantal grote, grijsgroene bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de broccoli naar een grote pot of zet hem buiten. Zorg dat de planten minstens 50 cm uit elkaar staan, ze worden groot."
			]),
		},
		{
			plant_id: 12,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 24,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er heeft zich een grote, krachtige koolplant gevormd met een dikke steel.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef elke week een beetje plantenvoeding en leg een laagje stro of gras rond de plant. Dat houdt de grond koel en vochtig."
			]),
		},
		{
			plant_id: 12,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "In het absolute centrum van de bladeren verschijnt de compacte groene bloemknop.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef nu extra veel water aan de basis van de plant. De broccoli-knop heeft veel vocht nodig om mooi groot te worden."
			]),
		},
		{
			plant_id: 12,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De broccoliknop is groot, stevig en gesloten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Snijd de broccoli schuin af met een scherp mes, voordat de gele bloemetjes zich openen. Als de knop geel wordt, is hij overrijp."
			]),
		},

		// 13. Salie (Totaal: 70 dagen)
		{
			plant_id: 13,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine ovale kiemblaadjes verschijnen langzaam boven de grond.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Licht vochtig houden" }),
			instructions: JSON.stringify([
				"Houd de aarde gelijkmatig vochtig, maar niet te nat. Salie ontkiemt het beste op een warme, lichte plek.",
				"Zet de pot op een warme en goed verlichte plek, maar niet in de volle felle zon. Een vensterbank op het zuiden is prima als het wat afgeschermd is."
			]),
		},
		{
			plant_id: 13,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 16,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bladeren krijgen hun kenmerkende zachte, fluweelachtige textuur.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Laat de bovenkant van de aarde tussen het water geven door een beetje opdrogen. Salie houdt niet van natte voeten.",
				"Zet de plant nu in de volle zon. Hoe meer zon, hoe meer smaak de blaadjes krijgen."
			]),
		},
		{
			plant_id: 13,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 28, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant groeit uit tot een stevig, grijsgroen kruidenstruikje.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig water" }),
			instructions: JSON.stringify([
				"Knip de jonge topjes af om de plant te stimuleren mooi vol en bossig te worden.",
				"Zorg dat overtollig water weg kan uit de pot. Salie gaat dood als de wortels in het water staan."
			]),
		},
		{
			plant_id: 13,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 28, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De saliebladeren zijn dik, aromatisch en oogstklaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig water" }),
			instructions: JSON.stringify([
				"Pluk de blaadjes naar behoefte of knip een heel takje af. Salie is het lekkerst als je de jonge, zachte blaadjes gebruikt."
			]),
		},

		// 14. Oregano (Totaal: 65 dagen)
		{
			plant_id: 14,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Piepkleine, ronde kiemblaadjes vormen zich aan het oppervlak.",
			requirements: JSON.stringify({ light: "Licht en warm", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Druk de zaadjes heel licht aan, maar bedek ze niet met aarde. Oregano heeft licht nodig om te ontkiemen.",
				"Gebruik een plantenspuit om water te geven, dan spoelen de kleine zaadjes niet weg."
			]),
		},
		{
			plant_id: 14,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt plukjes van kleine, ovale, behaarde blaadjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Zet de oregano op een zonnige vensterbank of buiten in de zon.",
				"Geef pas weer water als de aarde droog aanvoelt. Oregano komt uit droge, zonnige gebieden en kan goed tegen een beetje droogte."
			]),
		},
		{
			plant_id: 14,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 25, soil_min: 30, soil_max: 65, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een compacte, geurende bodembedekker van oregano is ontstaan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Knip de stengels terug als ze te lang en dun worden. Dan blijft de plant mooi compact.",
				"Oregano heeft geen extra meststoffen nodig. Op arme grond krijgt hij juist meer smaak."
			]),
		},
		{
			plant_id: 14,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 25, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De oregano zit boordevol etherische oli�n en is klaar voor gebruik.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig" }),
			instructions: JSON.stringify([
				"Knip takjes af vlak boven de grond. De smaak is het sterkst vlak voordat de plant gaat bloeien. Dat is het perfecte moment om te oogsten."
			]),
		},

		// 15. Koriander (Totaal: 55 dagen)
		{
			plant_id: 15,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De ronde zaden barsten open en de eerste kiemen verschijnen.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig houden" }),
			instructions: JSON.stringify([
				"Zaai koriander direct in de pot waar hij moet blijven staan. Koriander houdt niet van verpotten en gaat dan snel bloeien.",
				"Houd de grond steeds een beetje vochtig."
			]),
		},
		{
			plant_id: 15,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste gekartelde blaadjes, die erg lijken op peterselie, groeien uit.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, maar niet te veel. Koriander gaat snel bloeien als hij gestrest raakt. Een constante, rustige groei is het beste."
			]),
		},
		{
			plant_id: 15,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant vormt een weelderige rozet vol met frisse korianderbladeren.",
			requirements: JSON.stringify({ light: "Volle zon tot halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef water aan de basis van de plant, niet over de blaadjes heen.",
				"Als het heel warm is, zet koriander dan liever in de halfschaduw. Te veel hitte laat hem doorschieten naar de bloei."
			]),
		},
		{
			plant_id: 15,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bladeren zijn volgroeid en klaar om vers geoogst te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de buitenste stengels af of knip de hele plant vlak boven de grond af. Koriander groeit snel, dus je kunt vaak meerdere keren oogsten."
			]),
		},

		// 16. Bladpeterselie (Totaal: 80 dagen)
		{
			plant_id: 16,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Na een lange periode komen de fijne peterseliekiemen tevoorschijn.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Bladpeterselie heeft tijd nodig om te ontkiemen, dat kan wel 3 weken duren. Geef niet op! Houd de grond al die tijd gewoon vochtig."
			]),
		},
		{
			plant_id: 16,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De karakteristieke platte, diep ingesneden peterselieblaadjes openen zich.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plantjes uit de felle middagzon. Peterselie staat het liefst in de halfschaduw.",
				"Dun de zaailingen uit tot ze ongeveer 10 cm uit elkaar staan."
			]),
		},
		{
			plant_id: 16,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 28,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er staat een stevige, volle bos gezonde bladpeterselie.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, peterselie houdt van een constante vochtigheid.",
				"Verwijder gele blaadjes onderaan de stengels. Dan blijft de plant er mooi fris uitzien."
			]),
		},
		{
			plant_id: 16,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 5, temp_max: 20, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De peterseliestengels zijn lang en stevig genoeg voor de oogst.",
			requirements: JSON.stringify({ light: "Halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Oogst altijd de buitenste stengels en laat het hart van de plant staan. Dan groeit hij steeds door en kun je maandenlang blijven oogsten."
			]),
		},

		// 17. Dille (Totaal: 60 dagen)
		{
			plant_id: 17,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Fijne, draadachtige groene sprietjes breken door het grondoppervlak.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai dille direct in de volle grond of een diepe bak. Dille heeft een lange penwortel en kan niet goed tegen verpotten."
			]),
		},
		{
			plant_id: 17,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 25, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt de kenmerkende vederlichte, zachte dille-naaldjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de dille op een zonnige plek die beschermd is tegen harde wind. De dunne stengels kunnen makkelijk knakken."
			]),
		},
		{
			plant_id: 17,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 25, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De dilleplant groeit flink de hoogte in met weelderig, fijn loof.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Als de plant hoog wordt, kun je hem ondersteunen met een stokje zodat hij niet omwaait."
			]),
		},
		{
			plant_id: 17,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het fijne dille-groen is klaar om geplukt en verwerkt te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Knip de fijne veertjes af voordat de plant gaat bloeien. Na de bloei wordt de smaak minder."
			]),
		},

		// 18. Tomaat (Totaal: 90 dagen)
		{
			plant_id: 18,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De tomatenkiemen met langwerpige blaadjes staan boven de grond.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de aarde warm, rond 20 tot 22�C. Tomaten houden van warmte, dus een plekje boven de verwarming of in een warme kamer is ideaal.",
				"Zodra de eerste groene puntjes te zien zijn, zet je de pot op een lichte plek."
			]),
		},
		{
			plant_id: 18,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Eerste set gekartelde, echte bladeren is goed gevormd.",
			requirements: JSON.stringify({ light: "Licht", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de planten op een zeer lichte plek. Als de plantjes 4 echte blaadjes hebben, kun je ze diep verpotten in een grotere pot."
			]),
		},
		{
			plant_id: 18,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De hoofdstengel wordt dikker en maakt veel zijbladeren aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Plaats een stevige stok naast de plant en bind de stengel voorzichtig vast. Tomaten worden hoog en hebben steun nodig.",
				"Haal elke week de kleine scheutjes weg die in de oksels van de bladeren groeien. Dit heet dieven. Zo stopt de plant al zijn energie in de tomaten."
			]),
		},
		{
			plant_id: 18,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant schiet omhoog. Okselscheuten (dieven) zijn zichtbaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Blijf elke week de okselscheuten weghalen. Dit doe je het hele seizoen door.",
				"Geef nu elke week speciale tomatenvoeding. Tomaten hebben veel voeding nodig om grote, sappige vruchten te maken."
			]),
		},
		{
			plant_id: 18,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Trossen met kleine gele bloemen sieren de tomatenplant.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Tik zachtjes tegen de bloemetjes of schud de plant een beetje. Zo help je het stuifmeel verspreiden voor een goede bevruchting."
			]),
		},
		{
			plant_id: 18,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, volle tomaten zijn dieprood en plukklaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Oogst de tomaten door ze voorzichtig omhoog te draaien tot ze loskomen van de tros. Ze zijn het lekkerst als ze nog warm zijn van de zon."
			]),
		},

		// 19. Spruitjes (Totaal: 130 dagen)
		{
			plant_id: 19,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Koolkiemen met hartvormige blaadjes komen gelijkmatig op.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de zaaiaarde vochtig en koel. Spruitjes zijn echte buitenplanten en houden niet van te veel warmte."
			]),
		},
		{
			plant_id: 19,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Stevige jonge koolplantjes met blauwgroen blad hebben zich gevormd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Plant de spruitjes uit in de volle grond. Zet ze 50 cm uit elkaar, want ze worden groot."
			]),
		},
		{
			plant_id: 19,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant vormt een metershoge, dikke opgaande stam met grote bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Druk de aarde rond de stam stevig aan. Spruitjes moeten goed vaststaan, anders kunnen ze omwaaien in de wind."
			]),
		},
		{
			plant_id: 19,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 40,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "In de bladoksels langs de stam ontwikkelen zich kleine, harde knopjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef extra voeding voor koolplanten en houd insecten weg met een fijnmazig net. Spruitjes duren lang en hebben goede bescherming nodig."
			]),
		},
		{
			plant_id: 19,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 2, temp_max: 15, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De spruitjes onderaan de stam zijn compact, stevig en volgroeid.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Oogst de spruitjes van onder naar boven. Ze worden zoeter na een beetje vorst, dus wacht gerust tot na de eerste nachtvorst!"
			]),
		},

		// 20. Witte kool (Totaal: 100 dagen)
		{
			plant_id: 20,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kiemen verschijnen vlot boven de grond.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de aarde vochtig en zet de pot op een koele plek. Kool groeit het beste bij gematigde temperaturen."
			]),
		},
		{
			plant_id: 20,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plantjes hebben 4 echte, gladde koolbladeren ontwikkeld.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Plant de kool uit in voedzame grond. Kool heeft veel voeding nodig, dus meng wat compost door de aarde."
			]),
		},
		{
			plant_id: 20,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De grote buitenste bladeren beginnen zich naar binnen te vouwen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef elke week een beetje extra mest en bescherm de plant tegen rupsen. Koolwitjes leggen graag eitjes op de bladeren."
			]),
		},
		{
			plant_id: 20,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er vormt zich een loeiharde, dichte, gladde koolmassa in het centrum.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef nu heel regelmatig water. Als de kool plotseling veel water krijgt na een droge periode, kan hij barsten."
			]),
		},
		{
			plant_id: 20,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 5, temp_max: 18, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De witte koolkop is zwaar en keihard.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Snijd de kool met een groot, scherp mes vlak boven de grond af. Kool blijft lang goed op een koele plek."
			]),
		},

		// 21. Rode kool (Totaal: 105 dagen)
		{
			plant_id: 21,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De kiemblaadjes tonen direct een paars-rode gloed op de steeltjes.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de grond koel en vochtig. Rode kool is net als witte kool een buitenplant die niet van hitte houdt."
			]),
		},
		{
			plant_id: 21,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Mooie, dieppaarse koolplantjes zijn klaar om uitgeplant te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plantjes op een zonnige plek met kalkrijke grond. Rode kool groeit het beste in stevige, voedzame aarde."
			]),
		},
		{
			plant_id: 21,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bladeren groeien breed uit met een prachtige waslaag.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, vooral tijdens droge periodes. Als de plant te weinig water krijgt, stopt de koolvorming."
			]),
		},
		{
			plant_id: 21,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een compacte, donkerpaarse ronde kool sluit zich in het hart.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Leg een laagje stro of gemaaid gras rond de plant om de grond vochtig te houden. Dat helpt de kool om mooi groot te worden."
			]),
		},
		{
			plant_id: 21,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 5, temp_max: 18, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De dieppaarse rode kool is compact en volgroeid.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Snijd de kool af door de steel onder de kop krachtig door te snijden met een scherp mes."
			]),
		},

		// 22. Rucola (Totaal: 35 dagen)
		{
			plant_id: 22,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 5,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine kiempjes schieten vliegensvlug uit de grond.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai de zaadjes breed uit over de pot of in dunne rijtjes. Rucola groeit snel en kun je makkelijk in een bak op het balkon kweken.",
				"Houd de aarde vochtig. Rucola ontkiemt al binnen een paar dagen."
			]),
		},
		{
			plant_id: 22,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen vormen snel de eerste getande, pittig geurende blaadjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de grond vochtig. Als rucola te droog staat, wordt de smaak heel scherp en bitter."
			]),
		},
		{
			plant_id: 22,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een vol, mals bed van rucolablaadjes staat klaar.",
			requirements: JSON.stringify({ light: "Volle zon tot halfschaduw", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef bij warm weer elke dag een klein beetje water. Rucola groeit snel en heeft regelmatig water nodig om mals te blijven."
			]),
		},
		{
			plant_id: 22,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De rucola is perfect van formaat en heerlijk pittig.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de blaadjes vlak boven de grond af. Laat het hartje staan en je kunt 2 tot 3 keer her-oogsten van dezelfde plant!"
			]),
		},
		// 23. Pompoen (Totaal: 100 dagen)
		{
			plant_id: 23,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, vlezige kiembladen duwen de grond krachtig opzij.",
			requirements: JSON.stringify({ light: "Licht en warm", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Leg de zaden op hun zijkant in de aarde. Als je ze plat neerlegt, kunnen ze gaan rotten."
			]),
		},
		{
			plant_id: 23,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 13,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt enorme, ruwe bladeren en begint te ranken.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Pompoenen hebben veel ruimte nodig. Zet ze in een grote pot of in de volle grond met minstens een vierkante meter per plant."
			]),
		},
		{
			plant_id: 23,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Lange ranken kruipen alle kanten op met reusachtige bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef veel water en voeg af en toe wat compost of mest toe aan de basis. Pompoenen groeien enorm en hebben veel voeding nodig."
			]),
		},
		{
			plant_id: 23,
			stage_name: "Bloei",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 28, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote gele bloemen openen zich; bij de vrouwelijke bloemen groeit een bolletje.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Als je buiten kweekt, zorgen bijen voor de bestuiving. Binnen kun je met een zacht penseeltje van bloem naar bloem gaan."
			]),
		},
		{
			plant_id: 23,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 25, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De pompoen is intens gekleurd en de steel is kurkachtig en droog.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Snijd de pompoen af met een flink stuk steel eraan. Met een steeltje blijft hij veel langer goed."
			]),
		},

		// 24. Aubergine (Totaal: 100 dagen)
		{
			plant_id: 24,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine auberginekiemen komen langzaam boven.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Aubergines hebben veel warmte nodig om te ontkiemen. Een warmtematje of een plek boven de verwarming is ideaal, 22 tot 25�C is perfect."
			]),
		},
		{
			plant_id: 24,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt grote, zachte, lichtbehaarde bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de zaailingen naar een diepe pot en zet ze op de allerwarmste, zonnigste plek die je hebt."
			]),
		},
		{
			plant_id: 24,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant vormt een stevige, paarsachtige opgaande struik.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Plaats een stok naast de plant ter ondersteuning. De vruchten worden zwaar en de plant heeft steun nodig.",
				"Geef elke week wat vloeibare plantenvoeding."
			]),
		},
		{
			plant_id: 24,
			stage_name: "Bloei",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Prachtige paarse bloemen met een geel hart openen zich.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Tik de bloemetjes voorzichtig aan om ze te helpen met bestuiven. Aubergines doen het goed met een klein beetje hulp."
			]),
		},
		{
			plant_id: 24,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 28, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De aubergines zijn dieppaars, glanzen mooi en geven licht mee.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de aubergine met een schaar los, inclusief het groene kapje. Oogst ze als ze mooi glanzend zijn, voordat de schil dof wordt."
			]),
		},

		// 25. Paprika (Totaal: 90 dagen)
		{
			plant_id: 25,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste paprika-kiempjes breken door de grond heen.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zorg voor warmte (minimaal 20�C) en houd de aarde vochtig. Paprika's houden van een lekker warm plekje."
			]),
		},
		{
			plant_id: 25,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt de eerste sets puntige, glanzende bladeren.",
			requirements: JSON.stringify({ light: "Licht", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plantjes op een warme vensterbank. Zodra ze groot genoeg zijn, kun je ze verpotten naar een grotere pot."
			]),
		},
		{
			plant_id: 25,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De paprikaplant is nu een stevig, rechtopstaand struikje geworden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plant in de volle zon. Paprika's hebben heel veel zon nodig om zoet te worden.",
				"Voeg een klein stokje toe als steun, de takken kunnen afbreken onder het gewicht van de paprika's."
			]),
		},
		{
			plant_id: 25,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant vertakt zich in de top en maakt overal bloemknopjes aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef nu wat extra vloeibare plantenvoeding en zorg dat de grond steeds een beetje vochtig blijft."
			]),
		},
		{
			plant_id: 25,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Mooie, stervormige witte bloemetjes sieren de plant.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Tik de bloemetjes voorzichtig aan met je vinger om de bestuiving te helpen. Paprika's kunnen zichzelf bestuiven, maar een handje helpt."
			]),
		},
		{
			plant_id: 25,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De paprika's zijn stevig, glanzen en zijn volledig helderrood gekleurd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de paprika's met een schaar los, met een stukje steel eraan. Hoe langer je wacht, hoe zoeter en roder ze worden."
			]),
		},

		// 26. Bloemkool (Totaal: 85 dagen)
		{
			plant_id: 26,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De ronde koolzaadjes kiemen vlot uit.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de grond vochtig en zet de pot op een koele plek. Bloemkool is een koolsoort en groeit het beste bij gematigde temperaturen."
			]),
		},
		{
			plant_id: 26,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, grijsblauwe koolbladeren sieren de jonge zaailing.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Plant de bloemkool uit in voedzame, vochthoudende grond buiten op 50 cm afstand van elkaar."
			]),
		},
		{
			plant_id: 26,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 24,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bloemkoolplant vormt een weelderig, groot rozet van opgaande bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef wat extra voeding en bescherm de plant tegen rupsen. Koolwitjes kunnen veel schade aanrichten."
			]),
		},
		{
			plant_id: 26,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "In het verborgen hart verschijnt een spierwitte, compacte bloemknop.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Vouw de grote buitenbladeren voorzichtig over de witte knop. Zo blijft hij mooi wit en wordt hij niet geel van de zon."
			]),
		},
		{
			plant_id: 26,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bloemkool is groot, spierwit en de structuur is nog volledig gesloten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Snijd de bloemkool af met een scherp mes, net onder de kool. Laat een paar blaadjes eraan zitten ter bescherming."
			]),
		},

		// 27. Aardappel (Totaal: 100 dagen)
		{
			plant_id: 27,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste dikke, donkergroene scheuten breken door de aangeaarde grondrug.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Licht vochtig" }),
			instructions: JSON.stringify([
				"Gebruik voorgekiemde pootaardappelen (te koop bij het tuincentrum). Leg ze diep in de grond of in een ruime aardappelzak. Hoe meer aarde erbovenop, hoe meer aardappels er groeien."
			]),
		},
		{
			plant_id: 27,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Er groeit een stevige bos met ruwe, samengestelde bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zodra de stengels 15 cm hoog zijn, schep je extra aarde rond de basis. Dit heet aanaarden. Zo komen er meer aardappels aan de stengels te groeien."
			]),
		},
		{
			plant_id: 27,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof staat weelderig volwassen; ondergronds groeien de knollen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, vooral tijdens droge periodes. Aardappels hebben constant vocht nodig om mooie knollen te vormen."
			]),
		},
		{
			plant_id: 27,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof begint nu geel te kleuren en langzaam af te sterven.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Stop met water geven zodra het loof geel en slap begint te worden. De aardappels hebben nu genoeg vocht om te rijpen."
			]),
		},
		{
			plant_id: 27,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof is volledig dood; de aardappels ondergronds hebben een stevige schil.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Droog" }),
			instructions: JSON.stringify([
				"Graaf de aardappels voorzichtig op met een schep of riek. Pas op dat je de knollen niet beschadigt, want dan kunnen ze niet lang bewaard worden."
			]),
		},

		// 28. Knolselderij (Totaal: 140 dagen)
		{
			plant_id: 28,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Piepkleine, delicate kiemblaadjes komen traag boven.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig houden" }),
			instructions: JSON.stringify([
				"Dek de heel kleine zaadjes nauwelijks af met aarde. Knolselderij heeft licht nodig om te ontkiemen.",
				"Houd de grond warm en constant vochtig. Het kan even duren voordat de eerste groene puntjes verschijnen."
			]),
		},
		{
			plant_id: 28,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen vormen fijne selderijblaadjes en ruiken al kruidig.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de plantjes heel ondiep. De basis van het plantje mag niet te diep onder de grond komen, anders gaat de knol niet goed groeien."
			]),
		},
		{
			plant_id: 28,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 45,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een flinke bos met donkergroen loof staat fier; de knolbasis zwelt.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Knolselderij heeft heel veel water nodig. Geef regelmatig een flinke schep water en voeg af en toe wat kaliumrijke mest toe."
			]),
		},
		{
			plant_id: 28,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 40,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De robuuste, karakteristieke knol zit nu voor de helft boven de grond.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Verwijder af en toe de onderste, hangende bladeren. Zo stopt de plant meer energie in het dikker worden van de knol."
			]),
		},
		{
			plant_id: 28,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 5, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De knol is massief en groot genoeg om te oogsten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Wrik de knol los met een spade, snijd de wortels onderaan af en draai het loof er bovenaan af."
			]),
		},
		// 29. Mais (Totaal: 90 dagen)
		{
			plant_id: 29,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 26, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Dikke, grasachtige kokerkiemen schieten snel omhoog.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai de grote zaden direct buiten zodra de grond lekker warm is, rond half mei tot juni."
			]),
		},
		{
			plant_id: 29,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 26, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant vormt brede, rietachtige bladeren en een krachtige stengel.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet mais in een blok of vierkant in plaats van een lange rij. Zo kunnen ze elkaar beter bestuiven via de wind."
			]),
		},
		{
			plant_id: 29,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 24,
			thresholds: JSON.stringify({ temp_min: 14, temp_max: 26, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De maisstengels zijn manshoog geworden met brede uitwaaiende bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef extra voeding en druk de aarde rond de stengels goed aan. Mais wordt hoog en moet stevig staan."
			]),
		},
		{
			plant_id: 29,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 14, temp_max: 26, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "In de bladoksels verschijnen kolven, met aan de top een pluim.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zorg dat de mais genoeg water krijgt tijdens de bloei. Droogte kan de bestuiving verstoren."
			]),
		},
		{
			plant_id: 29,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 14, temp_max: 26, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De pluimen strooien stuifmeel; de maA?skolven krijgen lange, harige kwasten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Schud de stengels voorzichtig heen en weer om het stuifmeel te verspreiden. Dit helpt bij de bestuiving."
			]),
		},
		{
			plant_id: 29,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 24, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De kwasten zijn donkerbruin en verdroogd. De kolf staat schuin van de stengel.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig" }),
			instructions: JSON.stringify([
				"Kraak een korreltje open: als er melkachtig sap uitkomt, is de mais klaar. Draai de kolf met een ruk los van de stengel."
			]),
		},

		// 30. Bosui (Totaal: 60 dagen)
		{
			plant_id: 30,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Fijne groene speldenprikjes buigen zich recht uit de grond.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai in fijne rijtjes dicht op elkaar. Bosui kun je makkelijk in een bak op het balkon kweken.",
				"Houd de aarde constant een beetje vochtig."
			]),
		},
		{
			plant_id: 30,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen vormen dunne, holle, rechtopstaande sprieten.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de sprietjes een klein beetje uit tot ze ongeveer 3 tot 5 cm uit elkaar staan."
			]),
		},
		{
			plant_id: 30,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De stengelbasis kleurt helderwit en de sprieten worden stevig en dik.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de wortels vochtig en verwijder voorzichtig onkruid tussen de rijen."
			]),
		},
		{
			plant_id: 30,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bosuitjes zijn potlooddik en de bladeren frisgroen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Trek de bosuitjes met wortel en al uit de grond. Oogst ze als ze ongeveer zo dik zijn als een potlood."
			]),
		},

		// 31. Jalapeno (Totaal: 85 dagen)
		{
			plant_id: 31,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De eerste pittige kiemblaadjes vouwen open.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig houden" }),
			instructions: JSON.stringify([
				"Jalapeno's hebben veel warmte nodig, rond 22C of meer. Zet de pot op een warme plek en houd de aarde vochtig."
			]),
		},
		{
			plant_id: 31,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Eerste set echte bladeren staat krachtig op de zaailing.",
			requirements: JSON.stringify({ light: "Licht", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zodra de plantjes groot genoeg zijn en meerdere blaadjes hebben, verpot je ze naar een grotere pot."
			]),
		},
		{
			plant_id: 31,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De jalapenoplant is een bossig, stevig struikje met donkergroen blad.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plant op de zonnigste plek die je hebt. Hoe meer zon, hoe heter de pepers worden."
			]),
		},
		{
			plant_id: 31,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine knopjes vormen zich in de splitsingen van de takken.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef nu voeding die rijk is aan kalium. Dat helpt de plant om veel pepers te maken."
			]),
		},
		{
			plant_id: 31,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Witte bloemetjes hangen omlaag; de bloembladeren vallen langzaam af.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Schud de plant voorzichtig heen en weer om de bestuiving te helpen. De bloemetjes hangen omlaag en laten makkelijk stuifmeel vallen."
			]),
		},
		{
			plant_id: 31,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De jalapeno's zijn stevig, donkergroen en tonen soms lichte groeilijntjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd of knip de pepers los van de tak. Groen geoogst zijn ze heerlijk pittig. Laat je ze rood worden? Dan worden ze zoeter en heter tegelijk."
			]),
		},

		// 32. Rode chilipeper (Totaal: 90 dagen)
		{
			plant_id: 32,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaadjes kiemen en dunne kiemblaadjes verschijnen.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de zaaigrond warm en dek de pot af met plasticfolie tot de eerste kiempjes verschijnen."
			]),
		},
		{
			plant_id: 32,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing krijgt z'n eerste typische peperblaadjes.",
			requirements: JSON.stringify({ light: "Licht", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zodra de zaailingen boven de grond staan, hebben ze meteen veel licht nodig."
			]),
		},
		{
			plant_id: 32,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant groeit uit tot een vertakt, opgaand groen struikje.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet de plant op een warme, tochtvrije plek in de volle zon. Chilipepers gedijen het beste bij warmte en licht."
			]),
		},
		{
			plant_id: 32,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Talloze bloemknoppen hangen klaar aan de stengels.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef elke week wat vloeibare plantenvoeding om de plant te ondersteunen."
			]),
		},
		{
			plant_id: 32,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Bloemetjes bloeien en de basis van de eerste pepers zwelt op.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef nu regelmatig water. Als de plant te droog staat, kunnen de bloemetjes uitdrogen en afvallen."
			]),
		},
		{
			plant_id: 32,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Lange chilipepers zijn volledig glanzend dieprood gekleurd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de pepers met een schaar los om de takken niet te beschadigen. Hoe roder, hoe heter en zoeter."
			]),
		},

		// 33. Rode ui (Totaal: 100 dagen)
		{
			plant_id: 33,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Dunne, donkere uienlusjes richten zich langzaam op.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Voor het makkelijkste resultaat kun je kleine plantui-tjes kopen in plaats van ze zelf te zaaien. Die groeien sneller en geven minder werk."
			]),
		},
		{
			plant_id: 33,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het uienloof groeit gestaag omhoog in strakke blauwgroene pijpen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de rijen onkruidvrij. Uien houden niet van concurrentie van onkruid om licht en voeding."
			]),
		},
		{
			plant_id: 33,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De basis van de ui zwelt op en de paars-rode rokken worden zichtbaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Geef niet te veel water. Uien kunnen gaan rotten als ze te nat staan. Matig water geven is het beste."
			]),
		},
		{
			plant_id: 33,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof knikt vanzelf om en begint bruin en droog te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig water" }),
			instructions: JSON.stringify([
				"Stop helemaal met water geven zodra het loof omvalt. De uien moeten nu rijpen en droog staan."
			]),
		},
		{
			plant_id: 33,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De uienbollen liggen stevig droog in de grond met een papierachtige schil.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Droog" }),
			instructions: JSON.stringify([
				"Trek de uien aan het loof omhoog en laat ze een paar dagen op de grond drogen in de zon. Daarna kun je ze bewaren."
			]),
		},

		// 34. Gele ui (Totaal: 100 dagen)
		{
			plant_id: 34,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De fijne uiensprietjes komen gelijkmatig op uit de grond.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Houd de grond een beetje vochtig en dun de zaailingen uit als ze te dicht op elkaar staan."
			]),
		},
		{
			plant_id: 34,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Stevige uienpijpen groeien recht omhoog.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verwijder onkruid voorzichtig met de hand rond de uien, zodat je de wortels niet beschadigt."
			]),
		},
		{
			plant_id: 34,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Ondergronds vormt zich een mooie, dikke, goudgele uienbol.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Pas op met te veel water geven. Gele uien kunnen gaan schimmelen als ze te nat staan."
			]),
		},
		{
			plant_id: 34,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het loof van de gele ui valt om en droogt geelbruin in.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig water" }),
			instructions: JSON.stringify([
				"Laat de uien rustig rijpen zonder extra water. De droge grond zorgt voor een betere bewaring."
			]),
		},
		{
			plant_id: 34,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 30, soil_max: 60, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De gele uien zijn volgroeid en klaar voor langdurige bewaring.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Droog" }),
			instructions: JSON.stringify([
				"Oogst de uien op een droge dag en laat ze goed drogen op een luchtige plek voordat je ze opslaat."
			]),
		},

		// 35. Prei (Totaal: 120 dagen)
		{
			plant_id: 35,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Fijne preisprietjes komen in rijen op.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai prei in een zaaibakje of direct diep in een pot. Prei kun je makkelijk zelf kweken."
			]),
		},
		{
			plant_id: 35,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De preiplantjes zijn potlooddik en klaar om diep uitgeplant te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Maak smalle, diepe gaten van ongeveer 20 cm diep en laat het preiplantje erin zakken. Daarna geef je water om het gat te dichten. Zo krijg je een lange, witte prei."
			]),
		},
		{
			plant_id: 35,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De prei vormt stevige waaierbladeren en de schacht groeit.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Schep af en toe wat aarde tegen de stengel aan. Hoe meer aarde er tegen de stengel komt, hoe langer het witte deel wordt."
			]),
		},
		{
			plant_id: 35,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 30,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 60, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De preistammen zijn dik, zwaar en robuust ontwikkeld.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Blijf regelmatig water geven en af en toe wat mest. Prei heeft veel voeding en vocht nodig om dik te worden."
			]),
		},
		{
			plant_id: 35,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 4, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De prei is dik genoeg en klaar voor consumptie.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Steek een schep of spade onder de prei om hem met wortel en al omhoog te wrikken. Zo beschadig je de stengel niet."
			]),
		},

		// 36. Doperwten (Totaal: 65 dagen)
		{
			plant_id: 36,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Krachtige, gekrulde kiemscheuten breken door de grond.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai de grote doperwten direct buiten in de volle grond. Ze houden van koel lenteweer. Vanaf maart kun je ze al zaaien."
			]),
		},
		{
			plant_id: 36,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt fijne grijpgraten (ranken) om te klimmen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Zet meteen een klimrek, gaas of wat takken in de grond. Doperwten klimmen graag en hebben steun nodig."
			]),
		},
		{
			plant_id: 36,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 18,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De doperwt klimt flink omhoog en vormt een dichte, groene wand.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de bodem vochtig. Als de grond uitdroogt, stoppen de doperwten met groeien."
			]),
		},
		{
			plant_id: 36,
			stage_name: "Bloei",
			stage_order: 4,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Prachtige witte, vlinderachtige bloemetjes sieren de klimplant.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Na de bloei vormen zich direct kleine, platte peultjes. Dit worden straks de doperwten."
			]),
		},
		{
			plant_id: 36,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De peulen zijn dik, rond en de doperwten binnenin zijn duidelijk voelbaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Pluk de dikke peulen voorzichtig met twee handen los. Zo trek je de hele plant niet stuk."
			]),
		},

		// 37. Pastinaak (Totaal: 120 dagen)
		{
			plant_id: 37,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Fijne geveerde kiemblaadjes komen langzaam op.",
			requirements: JSON.stringify({ light: "Licht", water: "Constant vochtig" }),
			instructions: JSON.stringify([
				"Zaai pastinaak direct buiten; de wortels verdragen geen verhuizing.",
				"Houd de grond onafgebroken vochtig. Pastinaak ontkiemt traag, dus geef niet op."
			]),
		},
		{
			plant_id: 37,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Het weelderige loof groeit stevig uit en lijkt op peterselie.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de zaailingen voorzichtig uit tot ongeveer 15 cm afstand van elkaar."
			]),
		},
		{
			plant_id: 37,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 20, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Een volle, grote bos groen loof bedekt de bodem; de lange wortel groeit diep.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Matig water" }),
			instructions: JSON.stringify([
				"Geef een keer per week veel water. Diep water geven zorgt dat de wortel nog dieper de grond in groeit."
			]),
		},
		{
			plant_id: 37,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 50,
			thresholds: JSON.stringify({ temp_min: 2, temp_max: 18, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De witte wortelkop is dik en de pastinaak is volgroeid.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Minder water" }),
			instructions: JSON.stringify([
				"Oogst pastinaak het liefst na de eerste nachtvorst. De kou zet het zetmeel om in suikers, waardoor hij heerlijk zoet wordt."
			]),
		},

		// 38. Rettich (Totaal: 60 dagen)
		{
			plant_id: 38,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 5,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Grote, hartvormige kiembladeren schieten vliegensvlug omhoog.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai rettich direct in losse, diepe grond zonder stenen. De lange wortels hebben ruimte nodig om recht te groeien."
			]),
		},
		{
			plant_id: 38,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Ruwe, diep ingesneden bladeren vormen een rozet.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de rettichplantjes uit tot ongeveer 15 cm afstand."
			]),
		},
		{
			plant_id: 38,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 22, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De lange, spierwitte wortel zwelt op en duwt zichzelf iets boven de grond.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de grond gelijkmatig nat. Als rettich te droog staat, wordt hij taai en heel scherp van smaak."
			]),
		},
		{
			plant_id: 38,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 6, temp_max: 20, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De rettich is lang, stevig en klaar om geoogst te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Wrik de lange wortel voorzichtig los uit de grond. Als je trekt, kan hij breken."
			]),
		},

		// 39. Koolrabi (Totaal: 65 dagen)
		{
			plant_id: 39,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 7,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Koolkiemen met blauwgroene steeltjes komen vlot op.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zorg voor een lichte en koele plek. Koolrabi groeit het beste bij gematigde temperaturen."
			]),
		},
		{
			plant_id: 39,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen hebben stevige bladeren; de stengelbasis begint iets dikker te worden.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot de koolrabi naar een ruime pot of de volle grond. Plant ze niet te diep."
			]),
		},
		{
			plant_id: 39,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 24,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De stengel net boven de grond zwelt prachtig op tot een bovengrondse, lichtgroene knol.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Geef regelmatig water. Als de koolrabi te weinig water krijgt, wordt de knol taai en houtachtig."
			]),
		},
		{
			plant_id: 39,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De koolrabiknol heeft de grootte van een kleine tennisbal en is heerlijk mals.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de knol vlak onder de verdikking af en verwijder de grote bladeren. Hoe kleiner je oogst, hoe malser."
			]),
		},

		// 40. Groene chilipeper (Totaal: 80 dagen)
		{
			plant_id: 40,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine, glanzende peperkiempjes breken door de grond.",
			requirements: JSON.stringify({ light: "Indirect licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zorg voor constante warmte rond de 22C. Chilipepers komen uit warme streken."
			]),
		},
		{
			plant_id: 40,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 14,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 28, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing maakt puntige, gezonde peperbladeren aan.",
			requirements: JSON.stringify({ light: "Licht", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot naar een grotere pot zodra de wortels de bodem van de pot vullen."
			]),
		},
		{
			plant_id: 40,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 21,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De plant is veranderd in een stevig, vertakt en compact struikje.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef de plant een zonnig, warm plekje uit de wind."
			]),
		},
		{
			plant_id: 40,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine witte bloemknopjes hangen klaar in de vertakkingen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef nu vloeibare mest die rijk is aan kalium. Dat helpt bij de vorming van de pepers."
			]),
		},
		{
			plant_id: 40,
			stage_name: "Bloei",
			stage_order: 5,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De stervormige bloemetjes bloeien; de eerste mini-pepers worden gevormd.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Schud de plant voorzichtig om de bestuiving te helpen."
			]),
		},
		{
			plant_id: 40,
			stage_name: "Oogst",
			stage_order: 6,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 16, temp_max: 30, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De chilipepers zijn lang, glanzend groen, stevig en klaar voor gebruik.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Knip de pepers met een schaar los. Groen geoogst zijn ze heerlijk pittig en fris!"
			]),
		},

		// 41. Zoete aardappel (Totaal: 110 dagen)
		{
			plant_id: 41,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De jonge stekken tonen de eerste paarsgroene groeipuntjes.",
			requirements: JSON.stringify({ light: "Licht en warm", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Plant de gewortelde stekken diep in warme grond, maar wacht tot na de ijsheiligen (half mei)."
			]),
		},
		{
			plant_id: 41,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 20, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Prachtige, hartvormige bladeren beginnen lange ranken te vormen.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de bodem warm. Zwarte folie over de grond helpt om de warmte vast te houden."
			]),
		},
		{
			plant_id: 41,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 35,
			thresholds: JSON.stringify({ temp_min: 18, temp_max: 30, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De ranken kruipen weelderig over de grond; ondergronds zwellen de knollen aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water, maar zorg dat de grond niet in een modderpoel verandert."
			]),
		},
		{
			plant_id: 41,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 40,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 26, soil_min: 40, soil_max: 70, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De bladeren beginnen in de herfst geel te verkleuren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Weinig water" }),
			instructions: JSON.stringify([
				"Graaf de knollen voorzichtig op voor de eerste nachtvorst. Zoete aardappels zijn gevoelig voor kou."
			]),
		},

		// 42. Rode biet (Totaal: 70 dagen)
		{
			plant_id: 42,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 8,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kleine kiempjes met opvallend rood-paarse steeltjes verschijnen.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai rode biet direct buiten in rijtjes en houd de aarde goed vochtig."
			]),
		},
		{
			plant_id: 42,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 12,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailingen vormen langwerpige bladeren met felrode nerven.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de bieten uit tot ongeveer 10 cm afstand. Uit elk zaadje komen vaak meerdere plantjes, dus wees niet te zuinig."
			]),
		},
		{
			plant_id: 42,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 20, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Onder de weelderige rode bladbos zwelt een mooi rond knolletje op.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Geef regelmatig water. Als de grond te droog wordt, worden de bieten taai en houtachtig."
			]),
		},
		{
			plant_id: 42,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 25,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De rode knollen steken deels boven de grond uit en zijn klaar voor de oogst.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Trek de bietjes aan de bladbasis uit de grond. Draai het loof eraf in plaats van snijden, anders verliest de biet zijn mooie rode sap."
			]),
		},

		// 43. Bleekselderij (Totaal: 120 dagen)
		{
			plant_id: 43,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Hele fijne, kleine kiempjes komen zeer traag boven de grond tevoorschijn.",
			requirements: JSON.stringify({ light: "Licht", water: "Constant vochtig" }),
			instructions: JSON.stringify([
				"Dek de heel kleine zaadjes nauwelijks af. Bleekselderij heeft licht nodig om te ontkiemen."
			]),
		},
		{
			plant_id: 43,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 15, temp_max: 22, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De fragiele zaailingen krijgen hun eerste echte, herkenbare selderijblaadjes.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Verpot naar een diepe pot met voedzame grond zodra de plantjes groot genoeg zijn om vast te pakken."
			]),
		},
		{
			plant_id: 43,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 45,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 22, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De stelen groeien compact, recht omhoog en vormen een dichte cluster.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Houd de grond goed nat en geef regelmatig wat extra voeding. Bleekselderij heeft veel vocht nodig."
			]),
		},
		{
			plant_id: 43,
			stage_name: "Groeispurt",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 12, temp_max: 20, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De stelen worden dik, vlezig, sappig en schieten omhoog.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Veel water" }),
			instructions: JSON.stringify([
				"Bind de stelen de laatste weken samen. Zo worden ze bleker en malser van smaak."
			]),
		},
		{
			plant_id: 43,
			stage_name: "Oogst",
			stage_order: 5,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De volledige bleekselderijstruik is dik, knapperig en klaar voor consumptie.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Snijd de hele struik vlak boven de wortelbasis af met een scherp mes."
			]),
		},

		// 44. Raap (Totaal: 50 dagen)
		{
			plant_id: 44,
			stage_name: "Zaaien",
			stage_order: 1,
			duration_days: 5,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 60, soil_max: 90, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "Kloeke kiemblaadjes staan binnen enkele dagen al boven de aarde.",
			requirements: JSON.stringify({ light: "Licht", water: "Vochtig" }),
			instructions: JSON.stringify([
				"Zaai raapjes direct buiten in het voorjaar of najaar. Ze houden van koel weer."
			]),
		},
		{
			plant_id: 44,
			stage_name: "Kiem",
			stage_order: 2,
			duration_days: 10,
			thresholds: JSON.stringify({ temp_min: 10, temp_max: 18, soil_min: 50, soil_max: 80, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De zaailing ontwikkelt snel een rozet van heldergroene bladeren.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Dun de raapjes flink uit tot ongeveer 10 tot 15 cm uit elkaar."
			]),
		},
		{
			plant_id: 44,
			stage_name: "Blad",
			stage_order: 3,
			duration_days: 15,
			thresholds: JSON.stringify({ temp_min: 8, temp_max: 18, soil_min: 50, soil_max: 85, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De paars-witte, ronde knolletjes zwellen vlak onder het oppervlak vlot aan.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Houd de grond gelijkmatig vochtig. Zo blijven de raapjes zacht en worden ze niet taai."
			]),
		},
		{
			plant_id: 44,
			stage_name: "Oogst",
			stage_order: 4,
			duration_days: 20,
			thresholds: JSON.stringify({ temp_min: 6, temp_max: 16, soil_min: 40, soil_max: 75, light_min: 10000, light_max: 80000, humidity_min: 30, humidity_max: 80, required_daily_sun_hours: 6 }),
			validation_description: "De tweekleurige knolletjes zijn prachtig van formaat en perfect oogstklaar.",
			requirements: JSON.stringify({ light: "Volle zon", water: "Regelmatig" }),
			instructions: JSON.stringify([
				"Oogst ze als ze ongeveer zo groot zijn als een mandarijn. Dan zijn ze het malsst en het lekkerst."
			]),
		},
	];

	await knex("plant_stages").insert(stages);
}
