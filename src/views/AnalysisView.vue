<script setup lang="ts">

</script>

<template>
  <main>
    <div class="analysis p-10 rounded-2xl bg-white shadow-2xl border border-gray-200">
      <h1 class="analysis_title">Sources</h1>
      <div>
        La source principale de notre travail sont les recensements Lausannois, fournis par le Lausanne Time Machine
        lab, déjà scannés et transformés en fichiers csv. Ces derniers nous donnent l’ensemble des habitants hommes de
        la ville de Lausanne (ainsi qu' un nombre restreint de femmes, surtout des veuves) par année, et contient les
        données suivantes:
        <ul>
          <li class="retenu">Adresse (Rue et numéro)</li>
          <li>Nom du propriétaire</li>
          <li class="retenu">Nom du chef de famille</li>
          <li class="retenu">Prénom du chef de famille</li>
          <li class="retenu">Année de naissance du chef de famille</li>
          <li>Nom de l’épouse</li>
          <li>Année de naissance de l’épouse</li>
          <li class="retenu">Nom des enfants dans le domicile</li>
          <li class="retenu">Prénom des enfants dans le domicile</li>
          <li class="retenu">Année de naissance des enfants</li>
          <li class="retenu">Origine du chef de famille</li>
          <li class="retenu">Travail du chef de famille</li>
          <li>Nom des pensionnaires</li>
          <li>Prénom des pensionnaires</li>
          <li>Année de naissance des pensionnaires</li>
          <li>Origine des pensionnaires</li>
        </ul>
        Un nombre de ces catégories sont superflues pour notre analyse. En effet, étant donné que nous nous concentrons
        uniquement sur la relation entre parents et enfants, et que l’épouse n’a pas de champ décrivant son emploi, nous
        avons uniquement retenu les champs en gras.
        <br><br>
        Bien que nous avions à disposition un large nombre de recensements, nous avons décidé de n’en prendre qu’un
        nombre restreint, afin d’alléger le temps de computation et de faciliter l’analyse. Après avoir regardé la
        qualité des
        recensements et de leur recognition automatique, nous avons décidé d’utiliser les recensements suivants, qui
        semblaient avoir une représentativité satisfaisante à travers le temps et donc les générations:
        <ul class="flex flex-col">
          <li>1835</li>
          <li>1855</li>
          <li>1874</li>
          <li>1890</li>
        </ul>

        <h1 class="analysis_title">Méthodologie</h1>

        Afin de pouvoir observer et analyser les changements dans les métiers à travers le temps, il nous faut à la fois
        trouver les mêmes personnes à travers les différents census et avoir des métadonnées permettant d’analyser leur
        métiers. C’est pourquoi notre méthodologie se divise en deux parties: le traçage des personnes et
        l’enrichissement des métiers.

        <h2 class="analysis_subtitle">Traçage des individus</h2>

        Pour pouvoir trouver les mêmes individus à travers des census différents, nous avons construit un modèle
        permettant d’extraire les données de chaque personne appartenant à un recensement (enfants inclus) et, à partir
        de ces données, trouver si une personne dans un autre recensement est la même. Ensuite, si l’une de ces entrées
        est de la personne en tant qu’enfant, on peut facilement la lier à son parent et ainsi avoir les données de
        chaque individu en tant qu’adulte.
        <br><br>
        Afin de déterminer si deux personnes sont les mêmes, nous utilisons leur nom, prénom et origine. Si plusieurs
        personnes répondent à ces critères, nous utilisons les années de naissance et adresse (moins fiables) pour les
        différencier. Enfin, si des ambiguités restent, nous abandonnons la personne, afin de ne pas avoir des résultats
        faux et potentiellement biaisés. À partir de ces personnes que nous avons réussi à identifier et, nous essayons
        de trouver leurs parents. Si parmi les census d’un individu il existe une entrée en tant qu’enfant, cette
        dernière contient les données de son père.
        <br><br>
        Après l’ensemble de ce traitement, nous avons manuellement vérifié l'erreur. Pour le traçage des personnes,
        nous sommes autour des 90% de précision. Voici les données finales (à travers 4 recensements):
        <ul class="flex flex-col">
          <li>5251 personnes distinctes trouvées</li>
          <li>2435 liens parents / enfants trouvés</li>
          <li>1546 arbres familiaux trouvés</li>
        </ul>

        <h2 class="analysis_subtitle">Enrichissement des métiers</h2>
        Une étape importante pour réaliser une analyse quantitative sur ces données est la gestion de la donnée brute
        des métiers. Notre matière première est une chaîne de caractère pour chaque personne recensée correspondant à ce
        qui est lu par l'algorithme de reconnaissance de caractères. Ces chaînes de caractères contiennent des erreurs
        qu’il faut corriger.
        <br><br>
        Nous avons récupéré un dictionnaire de métiers historiques fourni par le Lausanne Time Machine Lab et associons
        chaque chaîne de caractère potentiellement erronée à une entrée du dictionnaire en minimisant une distance de
        Levenshtein. Nous avons corrigé certaines entrées du dictionnaire qui étaient problématiques et ne
        correspondaient pas à des métiers du 19ème siècle. Certaines chaînes sont trop erronées et ne peuvent être
        connectées à aucun métier sans dépasser un certain seuil d’erreur fixé, dans ce cas, l’entrée est ignorée et
        n’est pas prise en compte dans notre analyse. Nous utilisons un seuil de confiance de 90% et une mesure de
        Levenshtein normalisée. Sur un échantillon de 609 entrées 38 entrées n’ont pas pu être associées à un métier
        dans la limite de confiance fixée, 3 ont été associées à un métier de façon erronée. Cela correspond à environ
        6% de données perdues et moins de 0.5% de données erronées.
        <br><br>
        Enfin, la dernière étape de transformation des données est l’annotation des métiers et l’instauration de
        catégories.
        Dans un premier temps nous avons tenté d’établir des embeddings de chaque métier avec comme objectif
        l’instauration d’une mesure de distance mesurant les séparations sociales entre métiers. Cependant, cette
        approche a été abandonnée. Les embeddings ne donnaient pas de résultats concluants. Cette méthode introduit des
        biais dans la catégorisation des métiers qui sont impossibles à tracer et documenter en raison de l’opacité du
        modèle de langage utilisé pour générer les embeddings.
        Nous avons donc décidé d’annoter chaque métier à la main, selon les critères suivants:
        <ul>
          <li><b>Surface:</b> utilisée dans l’exercice du métier. 3 valeurs possibles: basse, moyenne et élevée. Cette
            valeur est élevée pour la plupart des métiers en extérieur, moyenne pour les métiers utilisant un atelier ou
            une boutique et basse pour les métiers demandant de travailler à une table.
          </li>
          <li><b>Durée de formation:</b> nécessaire à l’exercice du métier. 3 valeurs possibles: basse, moyenne, élevée.
            Cette valeur est moyenne ou plus pour tous les métiers nécessitant de savoir lire ou écrire, élevée pour
            tous les métiers demandant des études secondaires.</li>
          <li><b>Hiérarchie:</b> imposée par le métier. 2 valeurs possibles: employé, chef. Cette valeur est ‘employé’
            pour tous les métiers ne demandant pas de donner des ordres à une autre personne, employés, indépendants…
            Cette valeur est chef pour les métiers consistant à donner des instructions à d’autres personnes.</li>
          <li><b>Physicalité du métier:</b> 2 valeurs possibles: basse, élevée. Cette valeur est basse pour les métiers
            intellectuels, élevée pour les métiers demandant des gestes répétitifs et mettant en mouvement plusieurs
            membres, demandant de manipuler des objets lourds…</li>
          <li><b>Secteur:</b> 3 valeurs possibles: primaire, secondaire, tertiaire. Secteur primaire : produire ou
            extraire des matières premières. Secteur secondaire : prendre des matières premières et fabriquer des
            produits. Secteur tertiaire : industrie des services : aucun bien physique.</li>
          <li><b>Catégorie:</b> valeurs possibles: agriculture, journalier, propriétaire, commerce, éducation, industrie,
            textile et cuir, artisanat, alimentation... Il s'agit d'un rafinement des secteurs.</li>
          <li><b>Tranche de Revenu estimé:</b> 3 valeurs possibles: bas, moyen ou élevé.</li>
        </ul>
        Chaque métier a été manuellement annoté selon ces critères en utilisant les ressources suivantes pour obtenir
        des informations concernant les métiers historiques disparus: <a href="http://www.wikipedia.org"
          class="analysis_link">wikipedia.org</a>, <a href="http://www.vieuxmetiers.org"
          class="analysis_link">vieuxmetiers.org</a>,
        <a href="http://www.geneanet.org" class="analysis_link">geneanet.org</a>,
        <a href="http://www.lestracesdevosancetres.fr" class="analysis_link">lestracesdevosancetres.fr</a>.
        <br><br>
        Chaque critère étant plus ou moins difficile à évaluer étant donné le peu d’information disponible. Nous
        proposons un ordre de fiabilité des critères. Du plus fiable au moins fiable: secteur > physicalité >
        hiérarchie > durée de formation > surface > revenu.
        <h1 class="analysis_title">Résultats</h1>
        Afin d'analyser les changements au sein des familles, il est intéressant d'avoir une première vue d'ensemble de
        l'évolution des métiers. C'est pourquoi on peut regarder l'évolution selon les secteurs à travers les différents
        recensements:
        <img src="../assets/overall_sector.png" alt="Pourcentage de métiers par secteurs et par années">
        On peut voir une baisse du secteur primaire entre 1835 et 1855, qui se poursuit dans les années suivantes. Le
        tertiaire quant à lui, monte particulièrement à partir de 1890, tandis que le secondaire plafonne en 1874. Ces
        résultats montrent l’évolution de la ville à travers la révolution industrielle.
        <br><br>
        Lorsqu'on se penche sur la mobilité sociale à travers le siècle, nous pouvons d'abord nous pencher sur ces mêmes
        secteurs. A partir de nos paires parent/enfant, nous pouvons donc construire la matrice de transformation
        suivante:
        <img src="../assets/sector.png" alt="Matrice de transition des secteurs">
        La première chose à noter est que les enfants restent en général
        dans des métiers similaires à leurs parents. la plus grande part de changement étant les enfants de parents à
        secteur primaire qui prennent leur job dans des métiers du secteur secondaire.On observe toutefois chez le
        secteur primaire un mouvement important vers le secteur secondaire, qui peut être expliqué par
        l’industrialisation. C’est également surprenant de voir que la part de métiers du secteur tertiaire à revenir au
        primaire est plus importante que celle du secteur secondaire. Toutefois, le secteur tertiaire contient également
        bon nombre de métiers précaires et non pas des services nécessitant de grandes études, expliquant cette
        mobilité.
        <br><br>
        Pour affiner l'analyse, on peut séparer chaque secteur en sous catégorie. On sépare les journaliers et les métiers
        de l'agriculture du secteur primaire. On partitionne le secteur secondaire en quatre domaines : bâtiment, 
        cuir & textile, artisanat et alimentation. On identifie : éducation, commerce et transport pour le secteur tertiaire.
        On sépare aussi les métiers du secteur tertiaire implicant une supériorité hiérarchique. à noter que les seuls métiers
        annotés comme 'chef' qui ne se retrouvent pas dans la catégorie 'tertiare chef' sont: architecte (secondaire bâtiment),
        chef d'équipe (secondaire industrie) et épicier (tertiaire commerce). On identifie aussi le groupe des propriétaires et
        rentiers qui n'appartiennent pas directement à un secteur mais sont intéressants.
        <img src="../assets/transitions_white.png" alt="Matrice de transition des sous divisions des secteurs">
        À nouveau, on observe une forte reproduction sociale marquée par la diagonale. On remarque des liens intéressants entre
        les propriétaires et le secteur tertiaire. Pratiquement aucune personne dont le parent vient du secteur primaire ne
        devient propiétaire. Le commerce est l'activité du secteur tertiaire la plus connectée aux autres secteurs. Beaucoup d'enfants
        dont le parent vient du secteur primaire se retrouve dans le secteur secondaire, en particulier le bâtiment, mais l'inverse
        n'est pas le cas. Ceci est sans doute une conséquences de l'industrialisation de Lausanne et des grands changements au 19ème
        siècle comme le voutage du Flon. 

        <br><br>
        Enfin, nous pouvons nous pencher sur des métiers spécifiques. A cette fin, nous avons choisis 3 métiers
        possèdent de nombreux individus dans nos paires parent/enfant, qui représentent la classe populaire
        (agriculteur) et la classe moyenne-haute (négociant). Les rentiers quant à eux, ce sont des personnes qui
        reçoivent une rente, mais cette dernière peut provenir de l'état ou bien de fonds privés. Ainsi, ceux
        catégorisés comme "rentiers" peuvent provenir de classes sociales différents, mais il reste néanmoins
        intéressant d'analyser leurs relations. Pour chacune nous
        avons crée un
        diagramme de Sankey, afin de visualiser ce que deviennent les enfants des parents ayant le métier mentionné
        précedemment:

        <div class="flex-box">
          <img src="../assets/agriculteur.png" alt="Diagramme de Sankey - agriculteur" class="flex-item">
          <img src="../assets/negociant.png" alt="Diagramme de Sankey - négociant" class="flex-item">
          <img src="../assets/rentier.png" alt="Diagramme de Sankey - rentier" class="flex-item">
        </div>

        Ces diagrames montrent donc le rapport entre 3
        “métiers” faisant partie de 3 classes sociales différentes, par rapport aux métiers de leurs enfants. Sans
        grande surprise, les enfants de parents agriculteurs restent pour la plupart liés à l’agriculture, tandis que
        ceux issus de parents négociants ou une majorité des rentiers, possadant un capital financier plus important,
        ont pour la plupart
        soit des professions de prestige nécessitant des études, tels que banquier ou avocat, soit ils sont eux-mêmes
        propriétaires ou rentiers et sont capables de vivre de leurs acquis. On perçoit néanmoins un bon nombre de
        rentiers ayant des enfants à métiers plus "pauvres", ces derniers sont sans doute ceux dont la rente ne provient
        pas d'acquis financiers, mais de l'état ou d'une autre entité externe.


        <h1 class="analysis_title">Conclusion</h1>
        La tendance lors du 19ème siècle est d’une croissance du secteur tertiaire dans la ville de Lausanne et un
        déclin net du secteur primaire. Pourtant, alors qu’on est en pleine révolution industrielle, nous remarquons une
        chute du secteur secondaire en 1890, dont les valeurs atteignent presque celles de 1835. On pourrait donc
        supposer que le début du changement d’une économie de production vers une forme primitive de l’économie de
        services se situe aux alentours de 1880-90.
        <br><br>
        Concernant la mobilité sociale, celle-ci n'existe que très légèrement. Les enfants restent tendanciellement dans
        la
        même catégorie que leurs parents. La plus grande mobilité se trouve dans le secteur primaire, dont bon nombre
        d’enfants changent vers le secteur secondaire, tandis que près d’un quart des enfants naissant de parents
        travaillant dans l’industrie possèdent des métiers dans les services. Toutefois, les enfants à cette époque
        restent généralement dans le même domaine que leurs parents, et leur capital financier influe pour beaucoup dans
        les possibilités de leurs enfants.

      </div>
    </div>
  </main>
</template>

<style scoped>
.analysis_title {
  margin-bottom: 2%;
  text-align: center;
  font-size: 2.2rem;
  font-weight: bold;
}

.analysis {
  margin-top: 2%;
  margin-left: 10%;
  margin-right: 10%;
  margin-bottom: 6rem;
}

ul {
  margin-top: 5px;
  margin-bottom: 5px;
  column-count: 2;
  column-gap: 40px;
  list-style-type: disc;
  padding-left: 20px;
}

li {
  break-inside: avoid;
}

.retenu {
  font-weight: bold;
}

.analysis_subtitle {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.analysis_link {
  color: #0077cc;
  text-decoration: none;
  transition: color 0.2s ease;
}

.analysis_link:hover {
  color: #005fa3;
  text-decoration: underline;
}

img {
  margin: auto;
  max-width: 40rem;
}

.flex-box {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  justify-content: space-around;
}

.flex-item {
  max-width: 20rem;
}
</style>