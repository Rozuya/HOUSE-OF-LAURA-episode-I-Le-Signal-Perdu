/*
 * HOUSE OF LAURA · MANIFESTE AUDIO
 * ------------------------------------------------------------
 * C'est ICI que tu branches tes vraies musiques et tes vrais sons.
 *
 * 1. Dépose tes fichiers dans audio/music/ (ou audio/sfx/).
 *    Formats conseillés : .mp3 ou .ogg (le .wav marche aussi).
 * 2. Écris le chemin dans "file" ci-dessous (ou garde le nom proposé).
 * 3. C'est tout. Au lancement, le jeu teste chaque fichier :
 *      · fichier trouvé   -> il est joué (boucle, fondus enchaînés)
 *      · fichier absent   -> musique procédurale de secours
 *
 * Réglages par piste :
 *   file   : chemin du fichier (null = toujours procédural)
 *   volume : 0 à 1 (volume propre à la piste)
 *   loop   : true / false
 *   loopStart : (optionnel) seconde où la boucle redémarre (intro jouée une seule fois)
 *
 * Dans le jeu : Titre > Extras > Jukebox pour vérifier chaque piste
 * (la source "fichier" ou "procédural" y est indiquée).
 */
window.HOL_AUDIO = {
  music: {
    menu:          { file: 'audio/music/menu.mp3',          volume: 0.8, loop: true },
    maison:        { file: 'audio/music/maison.mp3',        volume: 0.8, loop: true },
    maison_noir:   { file: 'audio/music/maison_noir.mp3',   volume: 0.8, loop: true },
    quartier:      { file: 'audio/music/quartier.mp3',      volume: 0.8, loop: true },
    quartier_fete: { file: 'audio/music/quartier_fete.mp3', volume: 0.8, loop: true },
    foret:         { file: 'audio/music/foret.mp3',         volume: 0.8, loop: true },
    riviere:       { file: 'audio/music/riviere.mp3',       volume: 0.8, loop: true },
    grotte:        { file: 'audio/music/grotte.mp3',        volume: 0.8, loop: true },
    mystere:       { file: 'audio/music/mystere.mp3',       volume: 0.8, loop: true },
    tension:       { file: 'audio/music/tension.mp3',       volume: 0.8, loop: true },
    climax:        { file: 'audio/music/climax.mp3',        volume: 0.85, loop: true },
    fin:           { file: 'audio/music/fin.mp3',           volume: 0.8, loop: true },
    teaser:        { file: 'audio/music/teaser.mp3',        volume: 0.8, loop: true }
  },

  /* Bruitages (optionnels). Absents = sons procéduraux. */
  sfx: {
    jump:      { file: 'audio/sfx/jump.ogg',      volume: 0.6 },
    djump:     { file: 'audio/sfx/djump.ogg',     volume: 0.6 },
    land:      { file: 'audio/sfx/land.ogg',      volume: 0.5 },
    step:      { file: 'audio/sfx/step.ogg',      volume: 0.3 },
    dash:      { file: 'audio/sfx/dash.ogg',      volume: 0.6 },
    pulse:     { file: 'audio/sfx/pulse.ogg',     volume: 0.7 },
    collect:   { file: 'audio/sfx/collect.ogg',   volume: 0.6 },
    polaroid:  { file: 'audio/sfx/polaroid.ogg',  volume: 0.7 },
    hurt:      { file: 'audio/sfx/hurt.ogg',      volume: 0.7 },
    door:      { file: 'audio/sfx/door.ogg',      volume: 0.6 },
    lever:     { file: 'audio/sfx/lever.ogg',     volume: 0.6 },
    success:   { file: 'audio/sfx/success.ogg',   volume: 0.7 },
    fail:      { file: 'audio/sfx/fail.ogg',      volume: 0.6 },
    ability:   { file: 'audio/sfx/ability.ogg',   volume: 0.8 },
    reconnect: { file: 'audio/sfx/reconnect.ogg', volume: 0.7 },
    splash:    { file: 'audio/sfx/splash.ogg',    volume: 0.6 },
    break:     { file: 'audio/sfx/break.ogg',     volume: 0.7 },
    fire:      { file: 'audio/sfx/fire.ogg',      volume: 0.6 },
    menu_move: { file: 'audio/sfx/menu_move.ogg', volume: 0.4 },
    menu_ok:   { file: 'audio/sfx/menu_ok.ogg',   volume: 0.5 },
    menu_back: { file: 'audio/sfx/menu_back.ogg', volume: 0.5 },
    enemy:     { file: 'audio/sfx/enemy.ogg',     volume: 0.6 },
    boss_hit:  { file: 'audio/sfx/boss_hit.ogg',  volume: 0.8 },
    thunder:   { file: 'audio/sfx/thunder.ogg',   volume: 0.7 }
  },

  /* Durée par défaut des fondus enchaînés entre musiques (secondes) */
  crossfade: 2.0
};
