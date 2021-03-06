const missionlink = $('#mission_help').attr('href') || window.location.href.replace(/\?.*$/, "");
const missionID = missionlink.replace(/\?.*$/, "").replace(/\D/g, "");

$.get(missionlink)
    .done(data => {
        data = $(data);

        let vehicleDefinitons = {
            truck: "Autopompe",
            platform: "(c|C)amion con piattaforma",
            heavyRescue: "Veicoli di soccorso pesante",
            air: "Mobile Air",
            bchief: "capo-pattuglia",
            tanker: "(a|A)utobotti",
            hazmat: "Mezzi N.B.C.R.",
            mcv: "Mobile Command Vehicle",
            police: "Volanti della polizia",
            hems: "HEMS",
            rtw: "Ambulanza Medicalizzata",
            arff: "Flotta aerea antincendio AIB",
            k9: "Dog Support Units",
            swatSuv: "Armed Response Vehicle (ARV)",
            hems: "SAR Helicopter",
            policeHeli: "Police Helicopter"
        };

        let credits;
        let stations = {};
        let vehicles = {};
        let water;
        let poi;
        let prisonersMin = 0;
        let prisonersMax = 0;
        let patientsMin = 0;
        let patientsMax = 0;
        let nef = 0;
        let transport = 0;
        let specialisation;
        let tragehilfe = 0;
        let rth = 0;
        let special = {};
        let percentages = {};
        let expansions = [];
        let dauer;

        data.find(".col-md-4:nth-of-type(1) table tbody tr").each(function () {
            let content = $(this).text().trim();
            let number = $(this).find("td:last-of-type").text().trim().replace(/\D/g, "");
            if (content.match(/Media dei crediti/)) {
                credits = number;
            } else if (content.match(/richieste|Requisito|Min./)) {
                stations[getStation(content)] = number;
            } else if (content.match(/Luogo/)) {
                poi = getPOI(content);
            }
        });
        data.find(".col-md-4:nth-of-type(2) table tbody tr").each(function () {
            let content = $(this).text().trim();
            let number = $(this).find("td:last-of-type").text().trim().replace(/\D/g, "");
            if (content.match(/necessarie|necessari/)) {
                vehicles[getVehicle(content)] = number;
            } else if (content.match(/richiesta/)) {
                percentages[getVehicle(content)] = number;
            }
        });
        data.find(".col-md-4:nth-of-type(3) table tbody tr").each(function () {
            let content = $(this).text().trim();
            let number = $(this).find("td:last-of-type").text().trim().replace(/\D/g, "");
            if (content.match(/Max Pazienti/)) {
                patientsMax = number;
            } else if (content.match(/Numero minimo di pazienti/)) {
                patientsMin = number;
            } else if (content.match(/trasportato/)) {
                transport = number;
            } else if (content.match(/NEF/)) {
                nef = number;
            } else if (content.match(/Specializzazioni pazienti/)) {
                specialisation = $(this).find("td:last-of-type").text().trim();
            } else if (content.match(/Numero massimo di detenuti/)) {
                prisonersMax = number;
            } else if (content.match(/Armed Response Personnel/)) {
                special["SWATPersonnel"] = number;
            } else if (content.match(/Duration/)) {
                dauer = $(this).find("td:last-of-type").text().trim();
            } else if (content.match(/Missioni espandibili/)) {
                let expansionLinks = $(this).find("a");
                expansionLinks.each(function () {
                    expansions.push($(this).attr("href").replace(/\D/g, ""));
                });
            }
        });

        let mission = {
            name: data.find("h1").text().trim(),
            stations: stations
        };

        if (data.find(".col-md-4:nth-of-type(2) table tbody tr").length === 1) {
            mission.onlyRd = true;
            if (transport) {
                mission.transport = transport;
            }
            if (nef) {
                mission.nef = nef;
            }
            if (rth) {
                mission.rth = rth;
            }
            if (tragehilfe) {
                mission.tragehilfe = tragehilfe;
            }
            if (specialisation) {
                mission.specialisation = specialisation;
            }
        } else {
            mission.vehicles = vehicles;
            if (credits) {
                mission.credits = credits;
            }
            if (patientsMax > 0) {
                mission.patients = {
                    max: patientsMax
                };
                if (patientsMin > 0) {
                    mission.patients.min = patientsMin;
                }
                if (transport) {
                    mission.patients.transport = transport;
                }
                if (nef) {
                    mission.patients.nef = nef;
                }
                if (rth) {
                    mission.patients.rth = rth;
                }
                if (tragehilfe) {
                    mission.patients.tragehilfe = tragehilfe;
                }
                if (specialisation) {
                    mission.patients.specialisation = specialisation;
                }
            }
        }

        if (void 0 !== typeof poi) {
            mission.poi = poi;
        }

        if (water) {
            mission.water = water;
        }

        if (prisonersMax > 0) {
            mission.prisoners = {
                max: prisonersMax
            };
            if (prisonersMin > 0) {
                mission.prisoners.min = prisonersMin;
            }
        }

        for (let spec in special) {
            if (!mission.special) {
                mission.special = {};
            }
            mission.special[spec] = special[spec];
        }

        if (expansions) {
            mission.expansions = expansions;
        }

        if (percentages) {
            mission.percentages = percentages;
        }

        if (dauer) {
            mission.siwa = true;
            mission.dauer = dauer;
        }

        $.post(`${lssm.config.server}/modules/lss-missionHelper/writeMission.php`, {
            mission: mission,
            id: missionID,
            lang: "it_IT"
        })
            .done(response => {
                if (response.startsWith('Error')) {
                    return console.error(`missionHelper Error:\n${response}`);
                }
                console.log(`Registered Missiontype ${missionID}`);
                let missionhelper_content = $(`#${LSSM_MH_PREFIX} .content`);
                if (!missionhelper_content[0]) return;
                missionhelper_content.append(response);
                lssm_missionhelper_adjustPosition();
            })
            .fail(reason => {
                console.error(reason);
            });

        function getPOI(content) {
            let pois = [
                "Parco",
                "Lago",
                "Ospedale",
                "Bosco",
                "Fermata dell'autobus",
                "Fermata del tram",
                "Stazione ferroviaria \\(traffico regionale\\)",
                "Stazione ferroviaria \\(traffico regionale e viaggi a lunga distanza\\)",
                "Stazione merci",
                "Supermercato \\(piccolo\\)",
                "Supermercato \\(grande\\)",
                "Stazione di servizio",
                "Scuola",
                "Museo",
                "Centro commercial",
                "Officina meccanica",
                "Uscita autostradale",
                "Mercatino di Natale",
                "Storehouse",
                "Discoteca",
                "Stadio",
                "Azienda agricola",
                "Edificio adibito a uffici",
                "Piscina",
                "Railroad Crossing",
                "Teatro",
                "Luna park",
                "Fiume",
                "Piccolo aeroporto \\(pista\\)",
                "Grande aeroporto \\(pista\\)",
                "Terminal aeroporto",
                "Banca",
                "Magazzino",
                "Ponte",
                "Tavola calda",
                "Porto mercantile",
                "Piattaforma ecologica",
                "Grattacielo",
                "Molo navi da crociera",
                "Porticciolo",
                "Passaggio a livello",
                "Galleria",
                "Magazzino a celle frigorifere",
                "Centrale elettrica",
                "Fabbrica",
                "Deposito rottami",
                "Stazione metropolitana",
                "Piccolo serbatoio di accumulo sostanze chimiche",
                "Grande serbatoio di accumulo sostanze chimiche",
                "Hotel",
                "Bar",
                "Discarica",
                "Parcheggio coperto"
            ];
            for (let i = 0; i < pois.length; i++) {
                if (content.match(pois[i])) {
                    return i;
                }
            }
        }

        function getStation(content) {
            let stationDefinitions = {
                0: "Caserme dei vigili del fuoco",
                2: "Stazioni di soccorso",
                6: "stazioni di polizia",
                13: "Police Helicopter"
            };
            for (let station in stationDefinitions) {
                if (content.match(stationDefinitions[station])) {
                    return station;
                }
            }
        }

        function getVehicle(content) {
            for (let vehicle in vehicleDefinitons) {
                if (content.match(vehicleDefinitons[vehicle])) {
                    return vehicle;
                }
            }
        }
    });
