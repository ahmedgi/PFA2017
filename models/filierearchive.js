var mongoose = require("mongoose");
//filiere zrchive shema
var filierearchiveSchema = mongoose.Schema(
    {
        intitulee: {type: String, default: ''},
        annee1: {
            s1: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ],
            s2: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ]
        },
        annee2: {
            s1: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ],
            s2: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ]
        },
        annee3: {
            s1: [
                {

                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ],
            s2: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'modules'
                }
            ]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'prof'
        },
        responsable: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'prof'
        },
        creationDate: {type: Date, default: Date.now},
        lastUpdate: {type: Date, default: Date.now},
        accreditationdate: {type: Date, default: Date.now}

    }
);
filierearchiveSchema.methods.setAtt = function (att, value) {
    if (value) {
        this[att] = value;
    }
}

module.exports = mongoose.model('filierearchive', filierearchiveSchema);