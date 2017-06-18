var express = require("express");
var assert = require("assert");
var xlsx = require("xlsx");
var docxtemplater = require("docxtemplater");
var jszip = require("jszip");
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.redirect("/stages/etudiants/importer");
});

router.get("/etudiants/trouver", function (req, res, next) {
    res.render("stages/rechercher_etudiants", {
        title: "Rechercher des étudiants"
    });
});

router.get("/etudiants/importer", function (req, res, next) {
    req.app.db.collection("filieres").find({}).toArray(function (err, filieres) {
        assert.equal(err, null);
        res.render("stages/importer", {
            title: "Importer des étudiants",
            filieres: filieres
        });
    });
});

router.post("/etudiants/importer", function (req, res, next) {
    assert(req.files.fichier_etudiants !== null);

    var workbook = xlsx.read(req.files['fichier_etudiants'].data);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    var etudiants_raw = xlsx.utils.sheet_to_json(worksheet);

    console.log(first_sheet_name);

    req.app.db.collection("etudiants").deleteMany({
            annee_universitaire: req.body.annee_universitaire,
            filiere: req.body.filiere,
            niveau: req.body.niveau
        }, function (err, data) {
            assert.equal(err, null);

            var etudiants = [];

            etudiants_raw.forEach(function (etudiant_raw) {
                etudiants.push({
                    nom: etudiant_raw["Nom"],
                    prenom: etudiant_raw["Prénom"],
                    cne: etudiant_raw["CNE"],
                    annee_universitaire: req.body.annee_universitaire,
                    filiere: req.body.filiere,
                    niveau: req.body.niveau
                });
            });

            req.app.db.collection("etudiants").insertMany(etudiants);

            res.redirect("/stages/etudiants/" + req.body.annee_universitaire + "/" + req.body.filiere + "/" + req.body.niveau);
        }
    );
});

router.post("/etudiants/trouver", function (req, res, next) {
    res.redirect("/stages/etudiants/" + req.body.annee_universitaire + "/" + req.body.filiere + "/" + req.body.niveau);
});

router.get("/etudiants/:annee_universitaire/:filiere/:niveau", function (req, res, next) {
    req.app.db.collection("etudiants").find({
        annee_universitaire: req.params.annee_universitaire,
        filiere: req.params.filiere,
        niveau: req.params.niveau
    }).toArray(function (err, etudiants) {
        assert.equal(err, null);
        res.render("stages/liste_etudiants", {
            title: req.params.annee_universitaire + " / " + req.params.filiere + " / " + req.params.niveau,
            current: "Consultation",
            annee_universitaire: req.params.annee_universitaire,
            filiere: req.params.filiere,
            niveau: req.params.niveau,
            etudiants: etudiants
        });
    });
});

router.get("/etudiants/:cne/fiche", function (req, res, next) {
    req.app.db.collection("fiches").findOne({cne: req.params.cne}, function (err, fiche_document) {
        assert.equal(err, null);
        req.app.db.collection("etudiants").findOne({cne: req.params.cne}, function (err, etudiant_document) {
            assert.equal(err, null);

            if (fiche_document === null) {
                fiche_document = Object.assign({}, etudiant_document);
            }

            res.render("stages/fiche", {
                title: fiche_document.nom + " " + fiche_document.prenom + " - Fiche",
                fiche: fiche_document
            });
        });
    });
});

router.post("/etudiants/:cne/fiche", function (req, res, next) {
    req.app.db.collection("fiches").updateOne({cne: req.params['cne']}, {$set: req.body}, {upsert: true}, function (err, data) {
        assert.equal(err, null);

        res.redirect("/stages/etudiants/" + req.body.cne + "/fiche");
    });
});

router.get("/etudiants/:cne/demande", function (req, res, next) {

    var content = fs.readFileSync(path.resolve(__dirname, 'modele_demande.docx'), 'binary');

    var zip = new jszip(content);
    var doc = new docxtemplater().loadZip(zip);

    req.app.db.collection("etudiants").findOne({cne: req.params.cne}, function (err_etudiant, etudiant_document) {
        req.app.db.collection("filieres").findOne({abrev: etudiant_document.filiere}, function (err_filiere, filiere_document) {
            var date_au_plus_tot_depuis_annee = function (annee) {
                if (annee === 5) {
                    return "01/02/" + new Date().getFullYear();
                } else {
                    return "01/07/" + new Date().getFullYear();
                }
            };

            var annee_cycle_ingenieur_depuis_annee = function (annee) {
                var annee_provisoire = parseInt(annee) - 2;

                if (annee_provisoire === 1) {
                    return "1ère";
                } else {
                    return annee_provisoire + "ème";
                }
            };

            doc.setData({
                prenom: etudiant_document.prenom,
                nom: etudiant_document.nom,
                filiere: etudiant_document.filiere,
                annee_cycle_ingenieur: annee_cycle_ingenieur_depuis_annee(etudiant_document.niveau),
                date_au_plus_tot: date_au_plus_tot_depuis_annee(etudiant_document.niveau)
            });

            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render();
            }

            catch (error) {
                var e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties
                };

                console.log(JSON.stringify({error: e}));
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                throw error;
            }

            var buf = doc.getZip()
                .generate({type: "nodebuffer"});

            // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
            var nom_fichier_demande = "demande_" +
                etudiant_document.nom +
                "_" + etudiant_document.prenom +
                "_" + etudiant_document.cne +
                ".docx";

            //fs.writeFileSync(path.resolve(__dirname, nom_fichier_demande), buf);
            //res.download(buf);

            res.setHeader("Content-disposition", "attachment; filename=" + nom_fichier_demande);
            res.type("docx");

            res.send(buf);
        });
    });
});

module.exports = router;
