function calc_delta() {

    /* declare and type variables */

    var ext_horizontal = 0, ext_vertical = 0, arm_length = 0, effector_offset = 0, carriage_offset = 0, delta_smooth_rod_offset = 0, delta_radius = 0;
    var arm_angle_origin = 0, delta_radius_at_20deg = 0, delta_radius_at_0deg = 0, print_diam_effector = 0, print_diam_nozzle = 0;
    var corner_name = "", effector_name = "", carriage_name = "";
    var current_corner = {}, current_effector = {}, current_carriage = {};

    /* create objects */

    /* A Corner is a representation of an outer triangle piece, commonly called "frame_motor" or "frame_top" STLs
     *
     * The values are determined by looking at the STL, centering the origin (0,0)
     * on the middle of the extrusion/rods, then picking two points where the
     * horizontal extrusions touch. Those should be at the same X coord, one
     * negative and one positive, and at the same Y coord. A picture:
      
           \  \           /  /
            \  \         /  /
             \  \       /  /
              \  '-----'  /
              /           \
            /    ,-----,    \
          /      |     |      \
         1       |  0  |       2
          \      |     |      /
           '     '-----'     '
             '             '
               -----------

     * The distance between 1 and 2 is x_width
     * If 1 and 2 are closer IN towards the heatbed, y_offset is positive
     * If 1 and 2 are further AWAY from the heatbed, y_offset is negative
     */
           
    var DeltaCorner = function(){};
    DeltaCorner.prototype = { x_width: 0, y_offset: 0, extrusion: 20, html: "" };
    
    var corner_ultibots = new DeltaCorner();
    var corner_jaydm = new DeltaCorner();
    var corner_mming_2020 = new DeltaCorner();
    var corner_griffin = new DeltaCorner();
    var corner_mming_2040 = new DeltaCorner();
    var corner_hyperair_2040 = new DeltaCorner();
    var corner_kosselmax_2040 = new DeltaCorner();

    corner_ultibots.x_width = 35.65 * 2;
    corner_ultibots.y_offset = 1.5;
    corner_ultibots.html = "<a href='https://github.com/UltiBots/MKVS'>Ultibots GitHub</a>";

    corner_jaydm.x_width = 34.1757 * 2;
    corner_jaydm.y_offset = 2.76866;
    corner_jaydm.html = "<a href='https://github.com/Jaydmdigital/Kossel_2020'>jaydmdigital GitHub</a>";

    corner_mming_2020.x_width = 32.6479 * 2;
    corner_mming_2020.y_offset = 2.2271;
    corner_mming_2020.html = "<a href='https://www.thingiverse.com/thing:208458'>Kossel Frame 2020 by mming1106</a>";

    corner_griffin.x_width = 28.6144 * 2; // averaged this as griffin corners aren't perfectly square!
    corner_griffin.y_offset = -10.1103; // this seems a bad design choice, you lose like 20mm printable diameter over johann's corners!
    corner_griffin.html = "<a href='https://www.thingiverse.com/thing:259238'>Griffin 3D Delta Printer by Sheepdog</a>";

    corner_mming_2040.x_width = 32.6497 * 2;
    corner_mming_2040.y_offset = 12.2271;
    corner_mming_2040.extrusion = 40;
    corner_mming_2040.html = "<a href='https://www.thingiverse.com/thing:334838'>Kossel 2040 Kit by mming1106</a>";

    corner_hyperair_2040.x_width = 25 * 2;
    corner_hyperair_2040.y_offset = 10.1;
    corner_hyperair_2040.html = "<a href='https://www.thingiverse.com/thing:749151'>2040 Kossel Corner by hyperair</a>";

    corner_kosselmax_2040.x_width = 36.5722 * 2;
    corner_kosselmax_2040.y_offset = 13.6;
    corner_kosselmax_2040.extrusion = 40;
    corner_kosselmax_2040.html = "<a href='https://www.thingiverse.com/thing:668577'>Kossel MAX by wfcook</a>";

    corners = { "corner_sel_ultibots": corner_ultibots, "corner_sel_jaydm": corner_jaydm, "corner_sel_mming_2020": corner_mming_2020, "corner_sel_griffin": corner_griffin, "corner_sel_mming_2040": corner_mming_2040, "corner_sel_hyperair_2040": corner_hyperair_2040, "corner_sel_kosselmax_2040": corner_kosselmax_2040 };

    /* effector objects */

    var DeltaEffector = function(){};
    DeltaEffector.prototype = { effector_offset: 0, html: "", readonly: true };

    var effector_kosselmini = new DeltaEffector();
    var effector_calvinibav8 = new DeltaEffector();
    var effector_smarteffector = new DeltaEffector();
    var effector_custom = new DeltaEffector();

    effector_kosselmini.effector_offset = 20;
    effector_kosselmini.html = "<a href='https://github.com/jcrocholl/kossel'>jcrocholl GitHub</a>";

    effector_calvinibav8.effector_offset = 30;
    effector_calvinibav8.html = "<a href='https://www.thingiverse.com/thing:2297083'>Kossel Pro Effector V8 by calviniba</a>";

    effector_smarteffector.effector_offset = 35.22; // from kicad sources, 35.218394
    effector_smarteffector.html = "<a href='https://duet3d.com/wiki/Smart_effector_and_carriage_adapters_for_delta_printer'>Smart Effector by Duet3D</a>";

    effector_custom.html = "This is the distance from the effector centre to the axle axis.";
    effector_custom.readonly = false;

    effectors = { "effector_sel_kosselmini": effector_kosselmini, "effector_sel_calvinibav8": effector_calvinibav8, "effector_sel_smarteffector": effector_smarteffector, "effector_sel_custom": effector_custom };

    /* carriage objects */

    var DeltaCarriage = function(){};
    DeltaCarriage.prototype = { carriage_offset: 0, html: "", readonly: true };

    var carriage_mgn12_16mm = new DeltaCarriage();
    var carriage_ultibots_mk = new DeltaCarriage();
    var carriage_custom = new DeltaCarriage();

    carriage_mgn12_16mm.carriage_offset = 19.5;
    carriage_mgn12_16mm.html = "<a href='https://github.com/jcrocholl/kossel'>jcrocholl GitHub</a>";

    carriage_ultibots_mk.carriage_offset = 17;
    carriage_ultibots_mk.html = "<a href='https://github.com/UltiBots/MKVS'>Ultibots GitHub</a>";

    carriage_custom.html = "This is the distance from the extrusion face to the arm axle.";
    carriage_custom.readonly = false;

    carriages = { "carriage_sel_mgn12_16mm": carriage_mgn12_16mm, "carriage_sel_ultibots_mk": carriage_ultibots_mk, "carriage_sel_custom": carriage_custom };
    
    /* parse input */

    ext_horizontal = parseInt(document.getElementById("input_horiz").value);
    ext_vertical = parseInt(document.getElementById("input_vert").value);
    arm_length = parseInt(document.getElementById("input_arm").value);

    corner_name = document.getElementById("corner_sel").options[corner_sel.selectedIndex].value;
    effector_name = document.getElementById("effector_sel").options[effector_sel.selectedIndex].value;
    carriage_name = document.getElementById("carriage_sel").options[carriage_sel.selectedIndex].value;

    // corner selector
    
    current_corner = corners[corner_name];
    document.getElementById("label_corner_html").innerHTML = current_corner.html;

    // effector selector

    current_effector = effectors[effector_name];

    document.getElementById("input_effector_offset").value = current_effector.effector_offset;
    current_effector.readonly === true ? document.getElementById("input_effector_offset").setAttribute('readonly', 'readonly') : document.getElementById("input_effector_offset").removeAttribute('readonly');
    document.getElementById("label_effector_html").innerHTML = current_effector.html;

    // carriage selector
    
    current_carriage = carriages[carriage_name];
    document.getElementById("input_carriage_offset").value = current_carriage.carriage_offset;
    current_carriage.readonly === true ? document.getElementById("input_carriage_offset").setAttribute('readonly', 'readonly') : document.getElementById("input_carriage_offset").removeAttribute('readonly');
    document.getElementById("label_carriage_html").innerHTML = current_carriage.html;

    /* parse remaining input */

    effector_offset = parseInt(document.getElementById("input_effector_offset").value);
    carriage_offset = parseInt(document.getElementById("input_carriage_offset").value);
    carriage_offset = carriage_offset + (current_corner.extrusion / 2);

    /* calculations */

    /* The Apex
     *
     * To calculate SMOOTH_ROD_OFFSET for any given corner piece, it's easiest
     * if the corner STL's origin (0,0) is in the middle of the SMOOTH_ROD
     * axis. For extrusion corners, this means at the centre of the extrusion.
     * For rod corners, this means halfway between the middle of the two rods.
     *
     * Now pick the Corner X Points as described above. From the two Corner X
     * Points we can create an equilateral triangle where the third point
     * "outside" the printer will be called the Apex Point.
     *
     * We can find the distance from the Apex Point to its opposite side,
     * subtract the Corner Y distance, and that's how far the Apex Point is
     * from the SMOOTH_ROD_OFFSET. We'll call this the Apex Distance.
     *
     * Separately, add two sides of this equilateral triangle to the horizontal
     * extrusion length to create a larger equilateral triangle, the centroid of
     * which is the 0,0 point of the printer (i.e. the nozzle zero position).
     *
     * If we then take the distance from an Apex point to the large triangle's
     * centroid, and subtract the Apex Distance, we get the SMOOTH-ROD-RADIUS.
     */

    apex_distance = Math.sqrt(Math.pow(current_corner.x_width,2) - Math.pow(current_corner.x_width/2,2)) - current_corner.y_offset;
    apex_side_length = ext_horizontal + (current_corner.x_width * 2);
    apex_opposite_length = Math.sqrt(Math.pow(apex_side_length,2) - Math.pow(apex_side_length/2,2));
    apex_centroid = apex_opposite_length * (2/3);
    smooth_rod_offset = apex_centroid - apex_distance;

    delta_radius = smooth_rod_offset - effector_offset - carriage_offset;

    function radians(r) {
        return r * (Math.PI / 180);
    }

    function degrees(d) {
        return d / (Math.PI / 180);
    }

    arm_angle_origin = degrees(Math.acos(delta_radius/arm_length));
    delta_radius_at_20deg = Math.cos(radians(20)) * arm_length;
    delta_radius_at_0deg = Math.cos(radians(0)) * arm_length;
    arm_length_ideal = delta_radius / Math.cos(radians(60));
    print_diam_effector = delta_radius * 2;
    print_diam_nozzle = (delta_radius * 2) + effector_offset;

    /* output */

    document.getElementById("output_smooth_rod_offset").innerHTML = smooth_rod_offset.toFixed(3);
    document.getElementById("output_delta_radius").innerHTML = delta_radius.toFixed(3);

    document.getElementById("output_arm_angle_origin").innerHTML = arm_angle_origin.toFixed(2);
    document.getElementById("output_delta_radius_at_20deg").innerHTML = delta_radius_at_20deg.toFixed(2);
    document.getElementById("output_delta_radius_at_0deg").innerHTML = delta_radius_at_0deg.toFixed(2);
    document.getElementById("output_arm_length_ideal").innerHTML = arm_length_ideal.toFixed(1);

    //document.getElementById("output_print_diam_effector").innerHTML = print_diam_effector.toFixed(2);
    //document.getElementById("output_print_diam_nozzle").innerHTML = print_diam_nozzle.toFixed(2);
    
    function console_clear() {
        // https://stackoverflow.com/questions/31261667/how-to-clear-the-javascript-console-programmatically
        console.API;

        if (typeof console._commandLineAPI !== 'undefined') {
                console.API = console._commandLineAPI; // chrome
        } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
                console.API = console._inspectorCommandLineAPI; // safari
        } else if (typeof console.clear !== 'undefined') {
                console.API = console; // firefox
        }

        console.API.clear();
    }

    /* debug */
    
    if (true) {
        console_clear();
        console.log("arm_length = " + arm_length);
        console.log("ext_horizontal = " + ext_horizontal);
        console.log("ext_vertical = " + ext_vertical);
        console.log("effector_offset = " + effector_offset);
        console.log("carriage_offset = " + carriage_offset);
        console.log("apex_distance = " + apex_distance.toFixed(3));
        console.log("apex_side_length = " + apex_side_length.toFixed(3));
        console.log("apex_opposite_length = " + apex_opposite_length.toFixed(3));
        console.log("apex_centroid = " + apex_centroid.toFixed(3));
        console.log("smooth_rod_offset = " + smooth_rod_offset.toFixed(3));
        console.log("delta_radius = " + delta_radius.toFixed(3));
        console.log("arm_angle_origin = " + arm_angle_origin.toFixed(2));
        console.log("delta_radius_at_20deg = " + delta_radius_at_20deg.toFixed(2));
        console.log("delta_radius_at_0deg = " + delta_radius_at_0deg.toFixed(2));
        console.log("arm_length_ideal = " + arm_length_ideal.toFixed(2));
        console.log("print_diam_effector = " + print_diam_effector.toFixed(2));
        console.log("print_diam_nozzle = " + print_diam_nozzle.toFixed(2));
    }

    // TODO: figure out canvas and draw a horizontal representation

}

function engage() {
    // here's to the finest crew in starfleet - https://www.youtube.com/watch?v=X6oUz1v17Uo
    calc_delta();
}

