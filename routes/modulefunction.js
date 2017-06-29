var async = require('async')
var databaseModels = require('../models/databaseModels');


var generateModule=function(modulee,semester){
        var data = {
    universite: '',
    etablissement: '',
    departement: '',
    intitulee: '',
    code:'',
    coordonnateur_nom: '',
    coordonnateur_prenom: '',
    coordonnateur_grade: '',
    coordonnateur_specialite: '',
    coordonnateur_tel: '',
    coordonnateur_fax: '',
    coordonnateur_mail: '',
    prerequis: '',
    objectif: '',
    semestre:semester,
    eModules: [
        /*{
         intitulee: '',
         cour: '',
         td: '',
         tp: '',

         }*/
    ],
    enseignementCours_total: 0,
    enseignementTd_total: 0,
    enseignementTp_total: 0,
    enseignement_total: 0,
    activites: [
        /*{
         libellee: '',
         objectif: '',
         travauxTerrain: '',
         projet: '',
         stage: '',
         visiteEtude: '',
         }*/
    ],
    activitesTravauxTerrain_total: 0,
    activitesProjet_total: 0,
    activitesStage_total: 0,
    activitesVisiteEdute_total: 0,
    activites_total: 0,
    contenu: [
        /* {
         intitulee: '',
         description: '',
         }*/
    ],
    didactique: '',
    modalitee_evaluation: '',
    note: '',
    note_minimal: '',
}
var query = databaseModels.modules.findById(modulee._id).populate('eModules');
query.populate('coordonnateur');
query.exec(function(err,module){
    if(!err){
        data.universite = module.universite;
        data.code=module.code;
        data.departement = module.departement;
        data.etablissement = module.etablissement;
        data.intitulee = module.intitulee;
        data.prerequis = module.prerequis;
        data.objectif = module.objectif

        if (module.coordonnateur) {
            data.coordonnateur_nom = module.coordonnateur.nom;
            data.coordonnateur_prenom = module.coordonnateur.prenom;
            data.coordonnateur_grade = module.coordonnateur.grade,
                data.coordonnateur_specialite = module.coordonnateur.specialite;
            data.coordonnateur_tel = module.coordonnateur.tel;
            data.coordonnateur_fax = module.coordonnateur.fax;
            data.coordonnateur_mail = module.coordonnateur.email;
        }

        data.didactique = module.didactique;
        data.modalitee_evaluation = module.modalitee_evaluation;
        data.note = module.note;
        data.note_minimal = module.note_minimal;


        for (var i = 0; i < module.eModules.length; i++) {

            data.enseignementCours_total += module.eModules[i].volume_horaire.cour;
            data.enseignementTd_total += module.eModules[i].volume_horaire.td;
            data.enseignementTp_total += module.eModules[i].volume_horaire.tp;

            data.eModules.push({
                intitulee: module.eModules[i].intitulee,
                cour: module.eModules[i].volume_horaire.cour,
                td: module.eModules[i].volume_horaire.td,
                tp: module.eModules[i].volume_horaire.tp
            });

            for (var j = 0; j < module.eModules[i].activitees_pratique.length; j++) {
                data.activitesTravauxTerrain_total += module.eModules[i].activitees_pratique[j].travaux_terrain;
                data.activitesProjet_total += module.eModules[i].activitees_pratique[j].projet;
                data.activitesStage_total += module.eModules[i].activitees_pratique[j].stage;
                data.activitesVisiteEdute_total += module.eModules[i].activitees_pratique[j].visite_etude;
                data.activites.push({
                    libellee: module.eModules[i].activitees_pratique[j].libellee,
                    objectif: module.eModules[i].activitees_pratique[j].objectif,
                    travauxTerrain: module.eModules[i].activitees_pratique[j].travaux_terrain,
                    projet: module.eModules[i].activitees_pratique[j].projet,
                    stage: module.eModules[i].activitees_pratique[j].stage,
                    visiteEtude: module.eModules[i].activitees_pratique[j].visite_etude,
                })
            }

            data.contenu.push({
                intitulee: module.eModules[i].intitulee,
                description: module.eModules[i].description_programme,
            })
        }

        data.enseignement_total = data.enseignementCours_total + data.enseignementTd_total + data.enseignementTp_total;
        data.activites_total = data.activitesTravauxTerrain_total + data.activitesProjet_total + data.activitesStage_total + data.activitesVisiteEdute_total;
        return data;
        }
    });  
return data;
}

module.exports=generateModule;