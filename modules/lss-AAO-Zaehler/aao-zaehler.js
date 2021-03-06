/**
 * @author Fabian Hassels (https://github.com/eaglefsd)
 */
(function ($) {
    /**
     * Prüft, ob die Einsatzseite geöffnet ist oder nicht.
     * @return boolean true, wenn die aktuelle URL der Einsatzseite entspricht, false wenn nicht.
     */
    if(!window.location.href.match(/missions\/\d+$/)) return;

    /**
     * Erstellt das Element für den Zähler.
     */
    function erstelleZaehler() {
        $('.aao').each(function () {
            $(this).find('span:not(.glyphicon):first').after(' <span class="aaoZaehler">0</span>x');
        });

        $('[vehicle_group_id]').each(function () {
            $(this).find('div').after(' <span class="aaoZaehler">0</span>x');
        });

        // Zähler-Reset Button
        $('#mission-aao-group').after('<button id="resetAAOZaehler" class="btn  btn-default btn-xs" type="button">Reset AAO-Zähler</button>');
        // Zähler-Reset Funktion
        $('#resetAAOZaehler').click(function(){$('.aaoZaehler').replaceWith(' <span class="aaoZaehler">0</span>');});
    }

    /**
     * Setzt den AAO-Zaehler in dem angegebenen Element um eins nach oben.
     * @param element Das Element, in dem sich der AAO-Zaehler befindet.
     */
    function setzeAaoZaehlerHoch(element) {
        let aaoZaehler = parseInt($(element).find('.aaoZaehler').html());
        ++aaoZaehler;
        $(element).find('.aaoZaehler').html(aaoZaehler);
    }

    // Startlogik
    erstelleZaehler();

    $('.aao').bind('click', function () {
        setzeAaoZaehlerHoch(this);
    });

    $('[vehicle_group_id]').bind('click', function () {
        setzeAaoZaehlerHoch(this);
    });
})($);
