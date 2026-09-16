/**
 * Slug'dan Türkçe hareket ismi/talimat üretimi.
 *
 * Türkçe, İspanyolca/İngilizce'nin aksine baş-sonda (head-final) bir dildir:
 * sıfat/tamlayanlar önce, hareket ismi (ana isim) en sona gelir.
 *   [Duruş] [Tutuş] [Ekipman] [Varyant] [Değiştirici] [HAREKET]
 * Örn: seated-cable-row -> "Oturarak" + "Makarada" + "Çekme" = "Oturarak Makarada Çekme"
 *      dumbbell-lateral-raise -> "Dambılla" + "Yana" + "Kaldırma" = "Dambılla Yana Kaldırma"
 *
 * KAPSAM (v1): translate.js'teki İspanyolca sözlüğün jenerik/yüksek-frekans
 * kısımlarını (tekil hareket kökleri, ekipman, duruş, tutuş, değiştirici)
 * kapsar. ES dosyasındaki ~190 adet "tam ifade" özel-durum girdisi (örn.
 * "medicine-ball-chest-push-from-3-point-stance" gibi tek slug'a özel tam
 * cümleler) bilinçli olarak bu ilk sürüme dahil edilmedi; bu nadir/uzun-kuyruk
 * hareketler jenerik sözlük parçalarından otomatik birleştirilecek (daha az
 * "cilalı" ama doğru ve okunur Türkçe üretir). Gerekirse sonradan
 * overrides/<muscle>/<slug>.json üzerinden tek tek elle inceltilebilir.
 */

// ---------------------------------------------------------------------------
// Sözlükler
// ---------------------------------------------------------------------------

// Ana hareket kökü (ismin başlığı, en sona konur). Sırayla aranır, İLK eşleşen
// kullanılır (en spesifik/uzun ifadeler üstte olmalı).
const MOVEMENTS = [
	// Basınç (press) çeşitleri
	["bench-press", "Göğüs Baskısı"],
	["shoulder-press", "Omuz Baskısı"],
	["military-press", "Asker Baskısı"],
	["overhead-press", "Baş Üstü Baskı"],
	["chest-press", "Göğüs Baskısı"],
	["leg-press", "Bacak Presi"],
	["floor-press", "Yerde Baskı"],
	["french-press", "Fransız Baskı"],
	["jm-press", "JM Baskı"],
	["push-press", "İtme Baskısı"],
	["bent-press", "Eğik Baskı"],
	["w-press", "W Baskı"],
	["anti-gravity-press", "Antigravite Baskı"],
	["seesaw-press", "Almaşık Baskı"],
	["cuban-press", "Küba Baskısı"],
	["bradford-press", "Bradford Baskı"],
	["bradford-rocky-press", "Bradford-Rocky Baskı"],
	["arnold-press", "Arnold Baskı"],
	["scott-press", "Scott Baskı"],
	["behind-neck-press", "Ense Arkası Baskı"],
	["behind-head-press", "Ense Arkası Baskı"],
	["standing-behind-neck-press", "Ayakta Ense Arkası Baskı"],
	["pallof-press", "Pallof Baskısı"],
	["horizontal-pallof-press", "Yatay Pallof Baskısı"],
	["vertical-pallof-press", "Dikey Pallof Baskısı"],
	["press", "Baskı"],

	// Şınav / dominada / mekik ailesi
	["push-ups", "Şınav"],
	["push-up", "Şınav"],
	["pull-ups", "Barfiks"],
	["pull-up", "Barfiks"],
	["chin-ups", "Ters Barfiks"],
	["chin-up", "Ters Barfiks"],
	["muscle-up", "Muscle-up"],
	["muscle-ups", "Muscle-up"],
	["sit-ups", "Mekik"],
	["sit-up", "Mekik"],
	["v-ups", "V Mekik"],
	["v-up", "V Mekik"],
	["otis-up", "Otis-up"],
	["butt-ups", "Kalça Kaldırma"],
	["toes-to-bar", "Barda Ayak Ucu Değdirme"],
	["knees-to-elbows", "Barda Diz-Dirsek"],
	["knee-raises", "Diz Kaldırma"],
	["knee-raise", "Diz Kaldırma"],
	["push-sit-up", "İtmeli Mekik"],
	["press-sit-up", "Baskılı Mekik"],
	["jack-knife-sit-up", "Çakı Mekiği"],
	["jackknife-sit-up", "Çakı Mekiği"],
	["diamond-push-up", "Elmas Şınav"],
	["archer-push-up", "Okçu Şınavı"],
	["shoulder-tap-push-up", "Omuz Dokunuşlu Şınav"],
	["superman-push-up", "Superman Şınav"],
	["hindu-push-up", "Hindu Şınavı"],
	["single-arm-push-up", "Tek Kol Şınavı"],
	["two-arm-push-up", "İki Kol Şınavı"],
	["wide-hand-push-up", "Geniş El Şınavı"],
	["narrow-push-up", "Dar Şınav"],
	["close-grip-push-up", "Dar Tutuşlu Şınav"],
	["incline-push-up", "Eğimli Şınav"],
	["decline-push-up", "Ters Eğimli Şınav"],
	["weighted-push-up", "Ağırlıklı Şınav"],
	["side-push-up", "Yan Şınav"],
	["plyo-push-up", "Pliometrik Şınav"],
	["clap-push-up", "Alkışlı Şınav"],

	// Elevasyonlar
	["leg-raises", "Bacak Kaldırma"],
	["leg-raise", "Bacak Kaldırma"],
	["hip-raises", "Kalça Kaldırma"],
	["hip-raise", "Kalça Kaldırma"],
	["calf-raises", "Baldır Kaldırma"],
	["calf-raise", "Baldır Kaldırma"],
	["front-raises", "Ön Kaldırma"],
	["front-raise", "Ön Kaldırma"],
	["lateral-raises", "Yana Kaldırma"],
	["lateral-raise", "Yana Kaldırma"],
	["shoulder-raises", "Omuz Kaldırma"],
	["shoulder-raise", "Omuz Kaldırma"],
	["rear-delt-raise", "Arka Omuz Kaldırma"],
	["rear-lateral-raise", "Arka Yana Kaldırma"],
	["y-raise", "Y Kaldırma"],
	["hanging-leg-raise", "Asılı Bacak Kaldırma"],
	["hanging-leg-raises", "Asılı Bacak Kaldırma"],
	["hanging-knee-raise", "Asılı Diz Kaldırma"],
	["hanging-knee-raises", "Asılı Diz Kaldırma"],

	// Femoral / kuadriseps
	["leg-curls", "Bacak Büküşü"],
	["leg-curl", "Bacak Büküşü"],
	["inverse-leg-curl", "Nordik Bacak Büküşü"],
	["leg-extensions", "Bacak Ekstansiyonu"],
	["leg-extension", "Bacak Ekstansiyonu"],
	["triceps-extension", "Triceps Ekstansiyonu"],
	["tricep-extension", "Triceps Ekstansiyonu"],

	// Kalça
	["hip-thrusts", "Kalça İtişi"],
	["hip-thrust", "Kalça İtişi"],
	["good-mornings", "Good Morning"],
	["good-morning", "Good Morning"],

	// Kanat/kürek/kelebek
	["rear-delt-fly", "Arka Omuz Açması"],
	["rear-delt-flye", "Arka Omuz Açması"],
	["face-pulls", "Yüz Çekişi"],
	["face-pull", "Yüz Çekişi"],
	["facepulls", "Yüz Çekişi"],
	["facepull", "Yüz Çekişi"],
	["reverse-fly", "Ters Açma"],
	["reverse-flye", "Ters Açma"],
	["reverse-flies", "Ters Açma"],
	["reverse-flyes", "Ters Açma"],
	["chest-fly", "Göğüs Açması"],
	["chest-flye", "Göğüs Açması"],
	["chest-flies", "Göğüs Açması"],
	["chest-flyes", "Göğüs Açması"],
	["pec-deck", "Pec Deck"],
	["fly", "Açma"],
	["flye", "Açma"],
	["flies", "Açma"],
	["flyes", "Açma"],

	// Kürekler (row)
	["upright-rows", "Ayakta Kürek Çekme"],
	["upright-row", "Ayakta Kürek Çekme"],
	["bent-over-rows", "Eğilerek Kürek Çekme"],
	["bent-over-row", "Eğilerek Kürek Çekme"],
	["t-bar-row", "T-Bar Kürek"],
	["seal-rows", "Seal Kürek"],
	["seal-row", "Seal Kürek"],
	["pendlay-rows", "Pendlay Kürek"],
	["pendlay-row", "Pendlay Kürek"],
	["renegade-row", "Renegade Kürek"],
	["inverted-row", "Ters Kürek"],
	["inverted-rows", "Ters Kürek"],
	["high-row", "Yüksek Çekme"],
	["low-row", "Alçak Çekme"],
	["seated-row", "Oturarak Çekme"],
	["rows", "Çekme"],
	["row", "Çekme"],

	// Ölü kaldırma / olimpik
	["romanian-deadlift", "Romen Tarzı Ölü Kaldırma"],
	["stiff-leg-deadlift", "Düz Bacak Ölü Kaldırma"],
	["stiff-legged-deadlift", "Düz Bacak Ölü Kaldırma"],
	["sumo-deadlift", "Sumo Ölü Kaldırma"],
	["sumo-deadlift-high-pull", "Yüksek Çekişli Sumo Ölü Kaldırma"],
	["deadlift", "Ölü Kaldırma"],
	["clean-and-jerk", "Clean and Jerk"],
	["snatch", "Kapma (Snatch)"],
	["clean", "Cleaning (Clean)"],
	["jerk", "İtiş (Jerk)"],
	["rack-pull", "Rack Çekişi"],
	["snatch-pull", "Snatch Çekişi"],
	["clean-pull", "Clean Çekişi"],
	["high-pull", "Yüksek Çekiş"],

	// Triceps
	["skull-crushers", "Kafatası Kırıcı"],
	["skull-crusher", "Kafatası Kırıcı"],

	// Kardiyo / pliometri
	["jumping-jacks", "Jumping Jack"],
	["jumping-jack", "Jumping Jack"],
	["mountain-climbers", "Dağcı Adımı"],
	["mountain-climber", "Dağcı Adımı"],
	["burpees", "Burpee"],
	["burpee", "Burpee"],
	["box-jumps", "Kutuya Sıçrama"],
	["box-jump", "Kutuya Sıçrama"],
	["jump-rope", "İp Atlama"],
	["jump-squats", "Sıçramalı Çömelme"],
	["jump-squat", "Sıçramalı Çömelme"],
	["jump-lunges", "Sıçramalı Hamle"],
	["jump-lunge", "Sıçramalı Hamle"],
	["butt-kicks", "Topuk Kalçaya"],
	["high-knees", "Yüksek Diz"],
	["air-bike", "Havada Bisiklet"],
	["stationary-bike", "Sabit Bisiklet"],
	["ski-ergometer", "Kayak Ergometresi"],
	["ski-erg", "Kayak Ergometresi"],

	// Core
	["russian-twists", "Rus Bükülmesi"],
	["russian-twist", "Rus Bükülmesi"],
	["bicycle-crunches", "Bisiklet Mekiği"],
	["bicycle-crunch", "Bisiklet Mekiği"],
	["reverse-crunches", "Ters Mekik"],
	["reverse-crunch", "Ters Mekik"],
	["hanging-pike", "Asılı Pike"],
	["dead-bug", "Dead Bug"],
	["bird-dog", "Bird Dog"],
	["side-bend", "Yana Eğilme"],
	["side-bends", "Yana Eğilme"],
	["45-side-bend", "45 Derece Yana Eğilme"],
	["heel-touchers", "Topuğa Dokunma"],
	["toe-touch", "Ayak Ucuna Dokunma"],
	["toe-touches", "Ayak Ucuna Dokunma"],
	["flutter-kicks", "Makas Tekme"],
	["scissor-kicks", "Makas Tekme"],
	["inchworm", "Tırtıl Yürüyüşü"],
	["curl-up", "Kıvrılma Mekiği"],
	["pelvic-tilt", "Pelvik Tilt"],
	["l-sit", "L-Sit"],
	["landmine-180", "Landmine 180"],
	["landmine", "Landmine Dönüşü"],
	["crunches", "Mekik"],
	["crunch", "Mekik"],
	["twists", "Bükülme"],
	["twist", "Bükülme"],
	["holds", "İzometrik Tutuş"],
	["hold", "İzometrik Tutuş"],

	// Kalistenik ileri seviye
	["planche", "Planş"],
	["full-planche", "Tam Planş"],
	["flag", "İnsan Bayrağı"],
	["front-lever", "Front Lever"],
	["back-lever", "Back Lever"],
	["handstand-push-up", "Amuda Kalkarak Şınav"],
	["handstand", "Amuda Kalkma"],

	// Squat / hamle
	["goblet-squat", "Goblet Çömelme"],
	["front-squat", "Ön Çömelme"],
	["back-squat", "Arka Çömelme"],
	["bulgarian-split-squat", "Bulgar Çömelmesi"],
	["split-squat", "Split Çömelme"],
	["sumo-squat", "Sumo Çömelme"],
	["wall-sit", "Duvara Yaslı Otur"],
	["wall-ball", "Duvar Topu"],
	["box-squat", "Kutuya Çömelme"],
	["hack-squat", "Hack Çömelme"],
	["pistol-squat", "Pistol Çömelme"],
	["sissy-squat", "Sissy Çömelme"],
	["zercher-squat", "Zercher Çömelme"],
	["full-squat", "Tam Çömelme"],
	["overhead-squat", "Baş Üstü Çömelme"],
	["clean-grip-front-squat", "Clean Tutuşlu Ön Çömelme"],
	["squats", "Çömelme"],
	["squat", "Çömelme"],
	["lunges", "Hamle"],
	["lunge", "Hamle"],
	["step-ups", "Step-up"],
	["step-up", "Step-up"],

	// Jalon / pullover
	["lat-pulldown", "Lat Çekişi"],
	["pulldowns", "Çekiş (Pulldown)"],
	["pulldown", "Çekiş (Pulldown)"],
	["pull-down", "Çekiş (Pulldown)"],
	["pullovers", "Pullover"],
	["pullover", "Pullover"],
	["pushdown", "Pushdown"],
	["pushdowns", "Pushdown"],

	// Tekmeler
	["kickbacks", "Triceps Kikbek"],
	["kickback", "Triceps Kikbek"],
	["glute-kickback", "Kalça Kikbek"],
	["glute-kickbacks", "Kalça Kikbek"],
	["donkey-kicks", "Eşek Tekmesi"],
	["donkey-kick", "Eşek Tekmesi"],
	["fire-hydrants", "Yangın Musluğu"],
	["fire-hydrant", "Yangın Musluğu"],

	// Omuz silkme / fondu (dips)
	["shrugs", "Omuz Silkme"],
	["shrug", "Omuz Silkme"],
	["dips", "Paralelde İniş-Çıkış"],
	["dip", "Paralelde İniş-Çıkış"],
	["tricep-dip", "Triceps Dip"],
	["tricep-dips", "Triceps Dip"],
	["triceps-dip", "Triceps Dip"],
	["triceps-dips", "Triceps Dip"],
	["bench-dip", "Bankta Dip"],
	["bench-dips", "Bankta Dip"],

	// Plank / köprü
	["side-plank", "Yan Plank"],
	["side-bridge", "Yan Köprü"],
	["glute-bridge", "Kalça Köprüsü"],
	["planks", "Plank"],
	["plank", "Plank"],
	["bridges", "Köprü"],
	["bridge", "Köprü"],
	["clamshells", "Midye Açma"],
	["clamshell", "Midye Açma"],

	// Kettlebell / dinamik
	["swings", "Sallanma (Swing)"],
	["swing", "Sallanma (Swing)"],
	["thrusters", "Thruster"],
	["thruster", "Thruster"],

	// Bilek / parmak
	["wrist-curls", "Bilek Büküşü"],
	["wrist-curl", "Bilek Büküşü"],
	["finger-curls", "Parmak Büküşü"],
	["finger-curl", "Parmak Büküşü"],

	// Biceps curl aileleri
	["biceps-curl", "Biceps Büküşü"],
	["bicep-curl", "Biceps Büküşü"],
	["hammer-curl", "Çekiç Büküş"],
	["hammer-curls", "Çekiç Büküş"],
	["preacher-curl", "Preacher Büküş"],
	["preacher-curls", "Preacher Büküş"],
	["concentration-curl", "Konsantrasyon Büküş"],
	["concentration-curls", "Konsantrasyon Büküş"],
	["drag-curl", "Drag Büküş"],
	["drag-curls", "Drag Büküş"],
	["reverse-curl", "Ters Büküş"],
	["reverse-curls", "Ters Büküş"],
	["zottman-curl", "Zottman Büküş"],
	["spider-curl", "Spider Büküş"],
	["curls", "Büküş"],
	["curl", "Büküş"],

	// Abdüksiyon / addüksiyon
	["hip-abduction", "Kalça Abdüksiyonu"],
	["hip-adduction", "Kalça Addüksiyonu"],
	["leg-abduction", "Bacak Abdüksiyonu"],
	["leg-adduction", "Bacak Addüksiyonu"],
	["abductions", "Abdüksiyon"],
	["abduction", "Abdüksiyon"],
	["adductions", "Addüksiyon"],
	["adduction", "Addüksiyon"],

	// Esneme
	["stretches", "Esneme"],
	["stretch", "Esneme"],

	// Genel/fallback (en sonda, tek kelimelik en genel eşleşmeler)
	["raises", "Kaldırma"],
	["raise", "Kaldırma"],
	["extensions", "Ekstansiyon"],
	["extension", "Ekstansiyon"],
	["jumps", "Sıçrama"],
	["jump", "Sıçrama"],
];

// Varyant/isim (hareketle birlikte, genelde hemen önünde): "Çekiç Curl", "Arnold Baskı"
const VARIANTS = {
	hammer: "Çekiç",
	preacher: "Preacher",
	concentration: "Konsantrasyon",
	spider: "Spider",
	drag: "Sürüklemeli",
	reverse: "Ters",
	zottman: "Zottman",
	incline: "Eğimli",
	decline: "Ters Eğimli",
	flat: "Düz",
	"cross-body": "Vücuda Çapraz",
	"cross-bench": "Banka Çapraz",
	prone: "Yüzüstü",
	supine: "Sırtüstü",
	overhead: "Baş Üstü",
	scott: "Scott",
	arnold: "Arnold",
	bradford: "Bradford",
	cuban: "Küba",
	rocky: "Rocky",
	pendlay: "Pendlay",
	hindu: "Hindu",
	archer: "Okçu",
	nordic: "Nordik",
	norwegian: "Norveç",
	korean: "Kore",
	russian: "Rus",
	french: "Fransız",
	bulgarian: "Bulgar",
	romanian: "Romen",
	goblet: "Goblet",
	pistol: "Pistol",
	sissy: "Sissy",
	sumo: "Sumo",
	superman: "Superman",
	jm: "JM",
};

// Ekipman (baskı grubu, hareketten önce): "Halterle Curl"
const EQUIPMENT = {
	barbell: "Halterle",
	dumbbell: "Dambılla",
	dumbbells: "Dambıllarla",
	cable: "Makarada",
	cables: "Makaralarda",
	machine: "Makinede",
	smith: "Smith Makinesinde",
	"ez-bar": "EZ Barla",
	"ez-barbell": "EZ Barla",
	"olympic-barbell": "Olimpik Halterle",
	kettlebell: "Kettlebell'le",
	kettlebells: "Kettlebell'lerle",
	lever: "Makinede",
	bodyweight: "Vücut Ağırlığıyla",
	band: "Lastik Bantla",
	bands: "Lastik Bantlarla",
	"resistance-band": "Direnç Bandıyla",
	"trap-bar": "Trap Barla",
	rope: "Halatla",
	"v-bar": "V Barla",
	"straight-bar": "Düz Barla",
	"medicine-ball": "Sağlık Topuyla",
	"exercise-ball": "Pilates Topunda",
	"stability-ball": "Pilates Topunda",
	"swiss-ball": "Pilates Topunda",
	"bosu-ball": "Bosu Topunda",
	"foam-roller": "Foam Rollerle",
	towel: "Havluyla",
	sled: "Kızakta",
	sledge: "Kızakta",
	"cambered-bar": "Kavisli Barla",
	landmine: "Landmine'da",
	tubing: "Lastik Tüple",
	"battling-ropes": "Savaş Halatıyla",
	"battle-rope": "Savaş Halatıyla",
};

// Duruş (en başta): "Ayakta", "Oturarak"
const POSTURE = {
	standing: "Ayakta",
	seated: "Oturarak",
	sitting: "Oturarak",
	lying: "Yatarak",
	"side-lying": "Yan Yatarak",
	kneeling: "Diz Çökerek",
	squatting: "Çömelerek",
	"half-kneeling": "Tek Diz Çökerek",
	prone: "Yüzüstü",
	supine: "Sırtüstü",
	incline: "Eğimli",
	decline: "Ters Eğimli",
	flat: "Düz",
	side: "Yandan",
	hanging: "Asılı",
};

// Tutuş: "Dar Tutuşla"
const GRIPS = {
	"close-grip": "Dar Tutuşla",
	"wide-grip": "Geniş Tutuşla",
	"narrow-grip": "Dar Tutuşla",
	"medium-grip": "Orta Tutuşla",
	"reverse-grip": "Ters Tutuşla",
	"neutral-grip": "Nötr Tutuşla",
	"hammer-grip": "Çekiç Tutuşla",
	"underhand-grip": "Alttan Tutuşla",
	"overhand-grip": "Üstten Tutuşla",
	"supinated-grip": "Avuç Yukarı Tutuşla",
	"pronated-grip": "Avuç Aşağı Tutuşla",
	"mixed-grip": "Karışık Tutuşla",
	"inner-grip": "İç Tutuşla",
	"outer-grip": "Dış Tutuşla",
	"neutral-wrist": "Nötr Bilekle",
};

// Değiştiriciler: "Tek Kolla"
const MODIFIERS = {
	"one-arm": "Tek Kolla",
	"two-arm": "İki Kolla",
	"single-arm": "Tek Kolla",
	"single-leg": "Tek Bacakla",
	"one-leg": "Tek Bacakla",
	"two-legs": "İki Bacakla",
	"both-arms": "İki Kolla",
	"bent-knee": "Dizler Bükülü",
	"bent-knees": "Dizler Bükülü",
	"bent-arm": "Kol Bükülü",
	"bent-arms": "Kollar Bükülü",
	"bent-over": "Öne Eğilerek",
	"straight-leg": "Bacak Düz",
	"straight-legs": "Bacaklar Düz",
	"straight-arm": "Kol Düz",
	"straight-arms": "Kollar Düz",
	"straight-back": "Sırt Düz",
	"round-back": "Sırt Yuvarlak",
	"stiff-leg": "Düz Bacakla",
	"stiff-legs": "Düz Bacaklarla",
	"arms-overhead": "Kollar Yukarıda",
	"legs-up": "Bacaklar Yukarıda",
	"feet-up": "Ayaklar Yukarıda",
	"feet-elevated": "Ayaklar Yüksekte",
	"knees-up": "Dizler Yukarıda",
	twisting: "Dönerek",
	alternating: "Sırayla",
	alternate: "Sırayla",
	"front-to-back": "Öne Arkaya",
	"side-to-side": "Yana Yana",
	bilateral: "Çift Taraflı",
	unilateral: "Tek Taraflı",
	wide: "Geniş",
	narrow: "Dar",
	close: "Yakın",
	high: "Yüksek",
	low: "Alçak",
	front: "Ön",
	rear: "Arka",
	inner: "İç",
	outer: "Dış",
	horizontal: "Yatay",
	vertical: "Dikey",
	weighted: "Ağırlıklı",
	assisted: "Destekli",
	suspended: "Askıda",
};

// ---------------------------------------------------------------------------
// Tokenizer (dile bağlı değil; sadece İngilizce slug'ı ayrıştırır)
// ---------------------------------------------------------------------------

function buildPhrases(...maps) {
	const phrases = new Set();
	for (const m of maps) {
		const keys = Array.isArray(m) ? m.map((p) => p[0]) : Object.keys(m);
		for (const k of keys) {
			if (k.includes("-")) phrases.add(k);
		}
	}
	return [...phrases].sort((a, b) => b.length - a.length);
}

const ALL_PHRASES = buildPhrases(MOVEMENTS, VARIANTS, EQUIPMENT, POSTURE, GRIPS, MODIFIERS);

function tokenize(slug) {
	const parts = slug.toLowerCase().split("-");
	const tokens = [];
	let i = 0;
	while (i < parts.length) {
		let matched = null;
		for (const phrase of ALL_PHRASES) {
			const ph = phrase.split("-");
			if (ph.length > parts.length - i) continue;
			let ok = true;
			for (let j = 0; j < ph.length; j++) {
				if (parts[i + j] !== ph[j]) {
					ok = false;
					break;
				}
			}
			if (ok) {
				matched = phrase;
				break;
			}
		}
		if (matched) {
			tokens.push(matched);
			i += matched.split("-").length;
		} else {
			tokens.push(parts[i]);
			i += 1;
		}
	}
	return tokens;
}

const STOP_WORDS = new Set([
	"a", "an", "the", "of", "on", "in", "with", "for", "and", "to", "from",
	"v", "v-2", "v-3", "position", "motion", "stance", "grip", "version",
	"male", "female", "pov", "0656", "1766", "180",
]);

// Sözlükte olmayan tekil kelimeler için son çare (anatomi + genel terimler).
const EXTRA_WORDS = {
	biceps: "Biceps", bicep: "Biceps", triceps: "Triceps", tricep: "Triceps",
	forearm: "Önkol", forearms: "Önkol", chest: "Göğüs", back: "Sırt",
	shoulder: "Omuz", shoulders: "Omuz", abs: "Karın", core: "Core",
	glute: "Kalça", glutes: "Kalça", hamstring: "Arka Bacak",
	hamstrings: "Arka Bacak", quad: "Ön Bacak", quads: "Ön Bacak",
	calf: "Baldır", calves: "Baldır", delt: "Omuz", delts: "Omuz",
	lat: "Sırt Kanadı", lats: "Sırt Kanadı", trap: "Trapez", traps: "Trapez",
	pec: "Pektoral", pecs: "Pektoral", pectoral: "Pektoral", pectorals: "Pektoral",
	abductor: "Abduktör", abductors: "Abduktör", adductor: "Adduktör",
	adductors: "Adduktör", spine: "Omurga", oblique: "Yan Karın",
	obliques: "Yan Karın", leg: "Bacak", legs: "Bacak", arm: "Kol", arms: "Kol",
	hip: "Kalça", hips: "Kalça", knee: "Diz", knees: "Diz", wrist: "Bilek",
	wrists: "Bilek", finger: "Parmak", fingers: "Parmak", ankle: "Ayak Bileği",
	straight: "Düz", bent: "Bükülü", raised: "Kaldırılmış", balance: "Denge",
	double: "Çift", single: "Tek", half: "Yarım", full: "Tam", elbow: "Dirsek",
	elbows: "Dirsek", neck: "Boyun", walk: "Yürüyüş", walking: "Yürüyerek", running: "Koşarak",
	run: "Koşu", jogging: "Hafif Koşu", cycling: "Bisiklet", rowing: "Kürek",
	elliptical: "Eliptik", treadmill: "Koşu Bandı", stair: "Merdiven",
	stairs: "Merdiven", climber: "Tırmanıcı", climbers: "Tırmanıcı",
	upper: "Üst", lower: "Alt", floor: "Yerde", wall: "Duvarda", bench: "Bankta",
	box: "Kutuda", bar: "Bar", platform: "Platform", chair: "Sandalyede",
	step: "Step", bridge: "Köprü", rope: "Halat", towel: "Havlu",
	head: "Baş", hands: "Eller", behind: "Arkada", against: "Karşı",
	range: "Aralık", both: "İki", under: "Altında", over: "Üzerinde",
	on: "Üzerinde", with: "İle", and: "Ve", to: "'a", for: "İçin", of: "'in",
	the: "", outward: "Dışa", inward: "İçe", upward: "Yukarı",
	downward: "Aşağı", forward: "İleri", backward: "Geri", left: "Sol",
	right: "Sağ", boxing: "Boks", kick: "Tekme", kicks: "Tekme",
	stance: "Duruş", pose: "Poz", cross: "Çapraz", sprint: "Sprint",
	sprints: "Sprint", squat: "Çömelme", squats: "Çömelme",
	deadlift: "Ölü Kaldırma", ham: "Femoral",
};

function joinTitleWords(parts) {
	const seen = new Set();
	const out = [];
	for (const p of parts) {
		if (!p) continue;
		const key = p.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(p);
	}
	return out.join(" ");
}

/**
 * Türkçe isim üretimi: [Duruş] [Tutuş] [Ekipman] [Varyant] [Değiştirici]
 * [Kalan/anatomi] [HAREKET] sırasıyla birleştirilir (baş isim en sonda).
 */
function translateSlug(slug) {
	const tokens = tokenize(slug);
	const used = new Array(tokens.length).fill(false);

	let movement = null;
	for (const [key, value] of MOVEMENTS) {
		const idx = tokens.indexOf(key);
		if (idx !== -1) {
			movement = value;
			used[idx] = true;
			break;
		}
	}

	const variants = [];
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (VARIANTS[tok]) {
			variants.push(VARIANTS[tok]);
			used[i] = true;
		}
	});

	const equipment = [];
	const hasSmith = tokens.includes("smith");
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (hasSmith && tok === "machine") {
			used[i] = true;
			return;
		}
		if (EQUIPMENT[tok]) {
			equipment.push(EQUIPMENT[tok]);
			used[i] = true;
		}
	});

	const postures = [];
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (POSTURE[tok]) {
			postures.push(POSTURE[tok]);
			used[i] = true;
		}
	});

	const grips = [];
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (GRIPS[tok]) {
			grips.push(GRIPS[tok]);
			used[i] = true;
		}
	});

	const modifiers = [];
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (MODIFIERS[tok]) {
			modifiers.push(MODIFIERS[tok]);
			used[i] = true;
		}
	});

	const leftover = [];
	tokens.forEach((tok, i) => {
		if (used[i]) return;
		if (STOP_WORDS.has(tok)) return;
		if (/^\d+$/.test(tok)) return;
		const w = EXTRA_WORDS[tok] || (tok.charAt(0).toUpperCase() + tok.slice(1));
		if (w) leftover.push(w);
	});

	const orderedParts = [
		...postures,
		...grips,
		...equipment,
		...variants,
		...modifiers,
		...leftover,
	];
	if (movement) {
		orderedParts.push(movement);
	} else if (!orderedParts.length) {
		return slug;
	}

	let result = joinTitleWords(orderedParts);
	result = result.replace(/\s+/g, " ").trim();
	if (!result) return slug;
	return result;
}

// ---------------------------------------------------------------------------
// Talimat şablonları (jenerik)
// ---------------------------------------------------------------------------

const EQUIP_SETUP_TR = {
	barbell: "Halteri uygun ağırlıkla yükle ve başlangıç duruşunu al.",
	dumbbell: "Uygun ağırlıkta bir dambılı her iki elinize (veya belirtilen ele) alın.",
	cable: "Makarayı gerekli yüksekliğe ayarlayın ve ağırlığı seçin.",
	machine: "Makineyi vücudunuza göre ayarlayın ve ağırlığı seçin.",
	lever: "Makineyi vücudunuza göre ayarlayın ve ağırlığı seçin.",
	smith: "Barı Smith makinesinde uygun yüksekliğe getirin.",
	"ez-bar": "EZ barı uygun ağırlıkla yükleyin ve sıkıca kavrayın.",
	kettlebell: "Uygun ağırlıkta bir kettlebell alın ve duruşunuzu ayarlayın.",
	band: "Lastik bandı sabitleyin ve başlangıç gerginliğini koruyun.",
	bodyweight: "Doğru vücut hizasıyla başlangıç duruşunu alın.",
	other: "Ekipmanı hazırlayın ve başlangıç duruşunu alın.",
};

const CATEGORY_FOCUS_TR = {
	strength: "Hareketi kontrollü şekilde, tekniği bozmadan yapın.",
	stretching: "Zıplamadan, esnemeyi hissederek pozisyonu koruyun.",
	plyometrics: "Hareketi patlayıcı şekilde yapın ve kontrollü inin.",
	cardio: "Seviyenize uygun sabit bir tempo koruyun.",
};

const MUSCLE_NAME_TR = {
	abductors: "abduktörleri", abs: "karın kaslarını", adductors: "adduktörleri",
	biceps: "biceps kasını", calves: "baldırları", cardio: "kardiyovasküler sistemi",
	delts: "omuzları", forearms: "önkolları", glutes: "kalça kaslarını",
	hamstrings: "arka bacak kaslarını", lats: "sırt kanatlarını",
	"levator-scapulae": "levator scapulae kasını", pectorals: "göğüs kasını",
	quads: "ön bacak kaslarını", "serratus-anterior": "serratus anterior kasını",
	spine: "bel bölgesini", traps: "trapez kaslarını", triceps: "triceps kasını",
	"upper-back": "üst sırtı",
};

function generateInstructions({ muscle, equipment, category }) {
	const setup = EQUIP_SETUP_TR[equipment] || EQUIP_SETUP_TR.other;
	const focus = CATEGORY_FOCUS_TR[category] || CATEGORY_FOCUS_TR.strength;
	const muscleTr = MUSCLE_NAME_TR[muscle] || muscle;

	if (category === "stretching") {
		return [
			setup,
			`${muscleTr.charAt(0).toUpperCase()}${muscleTr.slice(1)} gerecek pozisyona geçin.`,
			"20-40 saniye derin nefes alarak pozisyonu koruyun.",
			"Yavaşça başlangıç pozisyonuna dönün ve isterseniz tekrarlayın.",
		];
	}
	if (category === "cardio") {
		return [
			setup,
			focus,
			"Core'unuzu sıkın ve hareket boyunca dik bir duruş koruyun.",
			"Planlanan süre veya tekrar sayısı kadar devam edin.",
		];
	}
	if (category === "plyometrics") {
		return [
			setup,
			"Gerginlik biriktirmek için kısa bir çömelme yapın.",
			focus,
			"Bacak ve core ile yumuşak inin, ardından bir sonraki tekrara geçin.",
		];
	}
	return [
		setup,
		`Harekete başlamadan önce ${muscleTr} kasın.`,
		focus,
		"Eksantrik fazı kontrol ederek başlangıç pozisyonuna dönün.",
		"Nefesinizi kontrol edin: zorlanırken verin, dönerken alın.",
	];
}

module.exports = {
	translateSlugTr: translateSlug,
	generateInstructionsTr: generateInstructions,
};
