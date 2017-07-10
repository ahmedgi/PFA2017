var express = require("express");
var assert = require("assert");
var xlsx = require("xlsx");
var docxtemplater = require("docxtemplater");
var jszip = require("jszip");
var fs = require('fs');
var path = require('path');
var router = express.Router();
var excel = require("node-excel-export");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.redirect("/stages/eleves/importer");
});

router.get("/eleves/rechercher", function(req, res, next) {
  res.render("stages/rechercher_eleves", {
    title: "Rechercher des élèves"
  });
});

router.get("/eleves/importer", function(req, res, next) {
  res.render("stages/importer_eleves.jade", {
    title: "Importer des élèves",
  });
});

router.post("/eleves", function(req, res, next) {
  assert(req.files.fichier_eleves !== null);

  var workbook = xlsx.read(req.files['fichier_eleves'].data);
  var first_sheet_name = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[first_sheet_name];
  var eleves_raw = xlsx.utils.sheet_to_json(worksheet);

  req.app.db.collection("eleves").deleteMany({
    annee_universitaire: req.body.annee_universitaire,
    filiere: req.body.filiere,
    niveau: req.body.niveau
  }, function(err, data) {
    assert.equal(err, null);

    var eleves = [];

    eleves_raw.forEach(function(eleve_raw) {
      eleves.push({
        nom: eleve_raw["Nom"],
        prenom: eleve_raw["Prénom"],
        cne: eleve_raw["CNE"],
        annee_universitaire: req.body.annee_universitaire,
        filiere: req.body.filiere,
        niveau: req.body.niveau
      });
    });

    req.app.db.collection("eleves").insertMany(eleves, function(err, data) {
      console.log(err);
    });

    res.redirect("/stages/eleves/" + req.body.annee_universitaire + "/" + req.body.filiere + "/" + req.body.niveau);
  });
});

router.post("/eleves/rechercher", function(req, res, next) {
  res.redirect("/stages/eleves/" + req.body.annee_universitaire + "/" + req.body.filiere + "/" + req.body.niveau);
});

router.get("/eleves/:annee_universitaire/:filiere/:niveau", function(req, res, next) {
  req.app.db.collection("eleves").find({
    annee_universitaire: req.params.annee_universitaire,
    filiere: req.params.filiere,
    niveau: req.params.niveau
  }).toArray(function(err, eleves) {
    assert.equal(err, null);
    res.render("stages/liste_eleves", {
      title: req.params.annee_universitaire + " / " + req.params.filiere + " / " + req.params.niveau,
      current: "Consultation",
      annee_universitaire: req.params.annee_universitaire,
      filiere: req.params.filiere,
      niveau: req.params.niveau,
      eleves: eleves
    });
  });
});

router.get("/eleves/:cne/fiche", function(req, res, next) {
  req.app.db.collection("fiches").findOne({
    cne: req.params.cne
  }, function(err, fiche_document) {
    console.log(err);
    req.app.db.collection("eleves").findOne({
      cne: req.params.cne
    }, function(err, eleve) {
      console.log(err);

      res.render("stages/fiche", {
        title: eleve.nom + " " + eleve.prenom + " - Fiche",
        eleve: eleve
      });
    });
  });
});

router.post("/eleves/:cne/fiche", function(req, res, next) {
  req.app.db.collection("eleves").updateOne({
    cne: req.params.cne
  }, {
    $set: { stage: req.body }
  }, {
    upsert: true
  }, function(err, data) {
    assert.equal(err, null);

    res.redirect("/stages/eleves/" + req.body.cne + "/fiche");
  });
});

router.get("/eleves/:cne/demande", function(req, res, next) {

  var content = fs.readFileSync(path.join(__dirname, "..", "..", "pdfTemplates", "stages", "demande.docx"), 'binary');

  var zip = new jszip(content);
  var doc = new docxtemplater().loadZip(zip);

  req.app.db.collection("eleves").findOne({
    cne: req.params.cne
  }, function(err_eleve, eleve_document) {
    var date_au_plus_tot_depuis_annee = function(annee) {
      if (annee === 5) {
        return "01/02/" + new Date().getFullYear();
      } else {
        return "01/07/" + new Date().getFullYear();
      }
    };

    var annee_cycle_ingenieur_depuis_annee = function(annee) {
      var annee_provisoire = parseInt(annee) - 2;

      if (annee_provisoire === 1) {
        return "1ère";
      } else {
        return annee_provisoire + "ème";
      }
    };

    doc.setData({
      prenom: eleve_document.prenom,
      nom: eleve_document.nom,
      filiere: eleve_document.filiere,
      annee_cycle_ingenieur: annee_cycle_ingenieur_depuis_annee(eleve_document.niveau),
      date_au_plus_tot: date_au_plus_tot_depuis_annee(eleve_document.niveau)
    });

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      var e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties
      };

      console.log(JSON.stringify({
        error: e
      }));
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      throw error;
    }

    var buf = doc.getZip()
      .generate({
        type: "nodebuffer"
      });

    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    var nom_fichier_demande = "demande_" +
      eleve_document.nom +
      "_" + eleve_document.prenom +
      "_" + eleve_document.cne +
      ".docx";

    //fs.writeFileSync(path.resolve(__dirname, nom_fichier_demande), buf);
    //res.download(buf);

    res.setHeader("Content-disposition", "attachment; filename=" + nom_fichier_demande);
    res.type("docx");

    res.send(buf);
  });
});

router.get("/eleves/:cne/convention", function(req, res, next) {

  var content = fs.readFileSync(path.join(__dirname, "..", "..", "pdfTemplates", "stages", "convention.docx"), "binary");

  var zip = new jszip(content);
  var doc = new docxtemplater().loadZip(zip);

  req.app.db.collection("eleves").findOne({
    cne: req.params.cne
  }, function(err, eleve) {

    doc.setData({
      nom_societe: eleve.stage.nom_societe,
      adresse_societe: eleve.stage.adresse_societe,
      telephone_societe: eleve.stage.telephone_societe,
      fax_societe: eleve.stage.fax_societe,
      filiere: eleve.filiere,
      nom: eleve.nom,
      prenom: eleve.prenom,
      annee_cycle_ingenieur: eleve.niveau - 2,
      debut: eleve.stage.debut,
      fin: eleve.stage.fin
    });

    try {
      doc.render();
    } catch (error) {
      var e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties
      };

      console.log(JSON.stringify({
        error: e
      }));
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      throw error;
    }

    var buf = doc.getZip()
      .generate({
        type: "nodebuffer"
      });

    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    var nom_fichier = "convention" +
      "_" + eleve.nom +
      "_" + eleve.prenom +
      "_" + eleve.cne +
      ".docx";

    res.setHeader("Content-disposition", "attachment; filename=" + nom_fichier);
    res.type("docx");

    res.send(buf);
  });
});

router.get("/pfes", function(req, res, next) {
  req.app.db.collection("pfes").find().toArray(function(err, pfes) {
    res.render("stages/liste_pfes", {
      title: "Liste des PFE",
      pfes: pfes
    })
  });
});

router.get("/pfes/new", function(req, res, next) {
    res.render("stages/pfe", {
      title: "Nouveau PFE"
    });
});

router.post("/pfes", function(req, res, next) {
  req.app.db.collection("pfes").insert(req.body, function(err, data) {
    console.log(err);
    res.redirect("/stages/pfes");
  });
});

router.get("/pfes/export", function(req, res, next) {
  req.app.db.collection("pfes").find().toArray(function(err, pfes) {
    const styles = {
      headerDark: {
        font: {
          color: {
            rgb: '00000000'
          },
        }
      },
      cellPink: {
        fill: {
          fgColor: {
            rgb: 'FFFFCCFF'
          }
        }
      },
      cellGreen: {
        fill: {
          fgColor: {
            rgb: 'FF00FF00'
          }
        }
      }
    };

    var specification = {
      nom_prenom: {
        displayName: "Nom + prénom",
        headerStyle: styles.headerDark
      },
      societe_ville: {
        displayName: "Société + ville",
        headerStyle: styles.headerDark
      },
      sujet: {
        displayName: "Sujet",
        headerStyle: styles.headerDark
      },
      technologies: {
        displayName: "Technologies utilisées",
        headerStyle: styles.headerDark
      },
      email_encadrant: {
        displayName: "Email de l'encadrant",
        headerStyle: styles.headerDark
      },
      email_encadrant: {
        displayName: "Email de l'encadrant",
        headerStyle: styles.headerDark
      },
      email: {
        displayName: "Email du stagiaire",
        headerStyle: styles.headerDark
      }
    }

    var report = excel.buildExport(
      [
        {
          specification: specification,
          data: pfes
        }
      ]
    );

    res.setHeader("Content-disposition", "attachment; filename=liste_PFE.xlsx");
    res.type("xlsx");
    res.send(report);
  });
});

module.exports = router;
