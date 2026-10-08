/*!
 * sc-lab.js: inline interactive synthetic control lab with four tabs.
 *
 * Loaded once per page by layouts/shortcodes/sc-lab.html through Hugo Pipes
 * (js.Build with target es2017, minified, fingerprinted). It has no
 * dependencies, and it starts every `.sc-lab[data-sc-lab]` element on the page.
 *
 * Every tab runs on the data of content/tutorials/python_sc101: the cigarette sales
 * of 39 states in 1970–2000 and the donor weights of each mlsynth fit. The
 * lab rebuilds every synthetic path and every gap from these two inputs:
 *
 *   synthetic(w)[t] = sum over donors j of w[j] * sales[j][t]
 *   gap(u, w)[t]    = sales[u][t] - synthetic(w)[t]
 *
 * The statistics follow script.py. The pre-treatment MSPE averages the squared
 * gaps over 1970–1988, the post-treatment MSPE averages them over 1989–2000,
 * the ratio divides the second by the first, and the ATT is the mean gap over
 * 1989–2000. The placebo test follows synth2. A placebo state stays in the
 * test when its pre-treatment MSPE is at most c times that of California.
 * California counts in the numerator and in the denominator of every p-value,
 * and the pointwise tests count |g| >= |g_CA|, g >= g_CA, and g <= g_CA.
 *
 * With its default controls, every tab reproduces sc101_results.json, and
 * tests/sc-lab.test.cjs checks this to 1e-9. The generated block below comes
 * from content/tutorials/python_sc101/build_sc_lab_data.py and is never edited
 * by hand.
 *
 * Page-safety contract: the script writes only plain numbers and words into
 * the page (textContent and attributes). It never writes TeX, HTML markup, or
 * a dollar sign, so MathJax and the code-block scripts of the site never see it.
 *
 * Test hook: window.ScLab exposes the pure functions (y, synth, gapOf,
 * summarize, mixer, placebo, intime, loo, looBand, fmt) and the data.
 */
(function () {
  'use strict';

  var W = typeof window !== 'undefined' ? window : {};
  if (W.ScLab && W.ScLab.__loaded) return; // loaded twice: keep the first copy

  // BEGIN GENERATED DATA: build_sc_lab_data.py
  // Written from content/tutorials/python_sc101/sc101_results.json. Do not edit
  // this block by hand; rerun the generator named above after script.py changes.
  var YEAR0 = 1970, T = 31, T0 = 19, CA = 2;
  var STATES = [
    'Alabama', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Georgia',
    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Mexico', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  // Cigarette sales times 10, one line per state; sales = Math.fround(k / 10).
  var CIG10 = [
    898, 954, 1011, 1029, 1082, 1117, 1162, 1171, 1230, 1214, 1232, 1196, 1191, 1163, 1130, 1145, 1163, 1140, 1121, 1056, 1086, 1079, 1091, 1085, 1071, 1026, 1014, 1049, 1062, 1007, 962, // Alabama
    1003, 1041, 1039, 1080, 1097, 1148, 1191, 1226, 1273, 1265, 1318, 1287, 1274, 1280, 1231, 1258, 1260, 1223, 1215, 1183, 1131, 1168, 1260, 1138, 1088, 1130, 1107, 1087, 1095, 1048, 994, // Arkansas
    1230, 1210, 1235, 1244, 1267, 1271, 1280, 1264, 1261, 1219, 1202, 1186, 1154, 1108, 1048, 1028, 997, 975, 901, 824, 778, 687, 675, 634, 586, 564, 545, 538, 523, 472, 416, // California
    1248, 1255, 1343, 1379, 1328, 1310, 1342, 1320, 1292, 1315, 1310, 1338, 1305, 1253, 1197, 1124, 1099, 1024, 946, 888, 874, 902, 883, 886, 891, 854, 831, 813, 812, 796, 730, // Colorado
    1200, 1176, 1108, 1093, 1124, 1102, 1134, 1173, 1175, 1174, 1180, 1164, 1147, 1141, 1125, 1110, 1085, 1090, 1048, 1006, 915, 867, 835, 791, 766, 793, 760, 759, 755, 734, 714, // Connecticut
    1550, 1611, 1563, 1547, 1513, 1476, 1530, 1533, 1555, 1502, 1505, 1526, 1541, 1496, 1440, 1445, 1424, 1410, 1371, 1317, 1272, 1188, 1200, 1238, 1261, 1272, 1283, 1241, 1328, 1395, 1407, // Delaware
    1099, 1157, 1170, 1198, 1237, 1229, 1259, 1279, 1306, 1310, 1340, 1317, 1312, 1286, 1263, 1288, 1290, 1293, 1241, 1171, 1138, 1096, 1092, 1092, 1078, 1003, 1027, 1006, 1005, 971, 884, // Georgia
    1024, 1085, 1261, 1218, 1256, 1233, 1251, 1250, 1228, 1175, 1152, 1141, 1115, 1113, 1036, 1007, 967, 950, 845, 784, 901, 854, 851, 867, 930, 782, 736, 750, 789, 751, 669, // Idaho
    1248, 1256, 1266, 1244, 1319, 1318, 1344, 1340, 1367, 1353, 1352, 1330, 1307, 1279, 1240, 1216, 1182, 1095, 1076, 1046, 941, 961, 948, 946, 857, 843, 818, 796, 803, 722, 700, // Illinois
    1346, 1393, 1492, 1560, 1596, 1624, 1666, 1730, 1509, 1489, 1469, 1485, 1477, 1430, 1378, 1353, 1376, 1340, 1340, 1325, 1283, 1272, 1282, 1268, 1282, 1354, 1351, 1353, 1359, 1333, 1255, // Indiana
    1085, 1084, 1094, 1106, 1161, 1205, 1244, 1255, 1271, 1242, 1246, 1329, 1162, 1156, 1112, 1094, 1041, 1011, 1002, 944, 954, 971, 952, 925, 934, 930, 940, 939, 940, 917, 889, // Iowa
    1140, 1028, 1110, 1152, 1186, 1234, 1277, 1279, 1271, 1264, 1271, 1320, 1309, 1276, 1217, 1157, 1094, 1052, 1032, 965, 943, 918, 900, 899, 891, 901, 887, 892, 876, 833, 798, // Kansas
    1558, 1635, 1794, 2019, 2124, 2230, 2309, 2294, 2247, 2149, 2153, 2097, 2106, 2011, 1832, 1824, 1798, 1712, 1732, 1716, 1825, 1704, 1676, 1676, 1701, 1753, 1790, 1868, 1713, 1653, 1562, // Kentucky
    1159, 1198, 1253, 1267, 1299, 1336, 1396, 1400, 1427, 1401, 1438, 1440, 1439, 1337, 1289, 1250, 1212, 1165, 1109, 1036, 1015, 1072, 1085, 1062, 1053, 1057, 1068, 1053, 1032, 1010, 1043, // Louisiana
    1285, 1332, 1365, 1380, 1421, 1407, 1449, 1456, 1439, 1385, 1412, 1389, 1395, 1354, 1355, 1279, 1190, 1250, 1250, 1224, 1175, 1161, 1145, 1085, 1016, 1023, 1000, 1011, 945, 855, 829, // Maine
    1043, 1164, 968, 1068, 1106, 1115, 1167, 1172, 1189, 1183, 1177, 1208, 1194, 1132, 1108, 1130, 1043, 1088, 941, 923, 907, 862, 838, 816, 834, 841, 817, 841, 832, 807, 760, // Minnesota
    934, 1054, 1121, 1150, 1171, 1168, 1209, 1221, 1249, 1239, 1270, 1253, 1258, 1223, 1164, 1153, 1132, 1100, 1090, 1083, 1018, 1056, 1039, 1054, 1060, 1075, 1069, 1063, 1070, 1039, 972, // Mississippi
    1213, 1276, 1300, 1321, 1354, 1356, 1395, 1408, 1418, 1402, 1421, 1405, 1397, 1341, 1300, 1292, 1288, 1287, 1274, 1228, 1191, 1199, 1223, 1216, 1194, 1240, 1241, 1206, 1201, 1180, 1138, // Missouri
    1112, 1156, 1222, 1199, 1219, 1237, 1249, 1270, 1272, 1203, 1220, 1211, 1224, 1137, 1101, 1036, 978, 917, 871, 862, 847, 829, 866, 860, 882, 905, 873, 889, 891, 826, 755, // Montana
    1081, 1086, 1049, 1066, 1105, 1141, 1181, 1177, 1174, 1161, 1163, 1170, 1171, 1108, 1077, 1051, 1031, 1013, 929, 938, 899, 924, 906, 911, 859, 885, 862, 855, 831, 866, 776, // Nebraska
    1895, 1905, 1986, 2015, 2047, 2052, 2014, 1908, 1870, 1833, 1777, 1719, 1651, 1592, 1366, 1467, 1426, 1477, 1419, 1379, 1373, 1155, 1100, 1081, 1052, 1009, 990, 956, 1024, 1039, 932, // Nevada
    2657, 2780, 2962, 2790, 2698, 2691, 2905, 2788, 2696, 2546, 2478, 2454, 2398, 2329, 2151, 2011, 1959, 1951, 1804, 1729, 1524, 1448, 1437, 1489, 1538, 1585, 1580, 1744, 1738, 1717, 1473, // New Hampshire
    900, 926, 993, 989, 1003, 1031, 1024, 1024, 1031, 1010, 1027, 1030, 975, 963, 889, 880, 882, 823, 777, 744, 708, 699, 714, 690, 682, 670, 657, 618, 626, 597, 538, // New Mexico
    1724, 1876, 2141, 2265, 2273, 2260, 2302, 2170, 2055, 1973, 1878, 1793, 1790, 1698, 1606, 1563, 1544, 1505, 1460, 1393, 1337, 1327, 1289, 1297, 1127, 1249, 1297, 1256, 1260, 1131, 1090, // North Carolina
    938, 985, 1038, 1087, 1105, 1179, 1254, 1222, 1219, 1213, 1237, 1257, 1268, 1196, 1094, 1032, 998, 923, 871, 841, 771, 852, 743, 830, 810, 806, 808, 775, 791, 747, 725, // North Dakota
    1216, 1246, 1244, 1205, 1221, 1225, 1246, 1273, 1313, 1309, 1335, 1328, 1340, 1300, 1271, 1267, 1263, 1246, 1224, 1186, 1155, 1132, 1123, 1089, 1086, 1117, 1076, 1086, 1064, 1040, 999, // Ohio
    1084, 1154, 1217, 1241, 1305, 1329, 1386, 1404, 1436, 1416, 1416, 1437, 1470, 1400, 1281, 1242, 1199, 1131, 1036, 975, 884, 878, 863, 862, 1048, 1095, 1108, 1118, 1122, 1114, 1089, // Oklahoma
    1073, 1063, 1090, 1107, 1142, 1146, 1188, 1201, 1223, 1226, 1240, 1252, 1233, 1253, 1153, 1158, 1139, 1106, 1076, 1071, 1013, 1025, 962, 947, 954, 954, 933, 929, 921, 911, 879, // Pennsylvania
    1239, 1232, 1344, 1420, 1461, 1547, 1502, 1488, 1468, 1458, 1493, 1512, 1463, 1358, 1369, 1334, 1363, 1244, 1380, 1208, 1014, 1036, 1001, 941, 919, 908, 875, 900, 887, 869, 831, // Rhode Island
    1036, 1150, 1187, 1255, 1297, 1305, 1368, 1372, 1404, 1357, 1383, 1361, 1360, 1311, 1270, 1254, 1266, 1266, 1244, 1224, 1186, 1215, 1128, 1152, 1122, 1092, 1029, 1245, 1269, 1094, 1039, // South Carolina
    927, 967, 1030, 1035, 1084, 1135, 1167, 1156, 1169, 1174, 1147, 1157, 1130, 1098, 1057, 1044, 970, 958, 919, 874, 883, 918, 930, 916, 948, 986, 923, 888, 883, 835, 751, // South Dakota
    998, 1063, 1115, 1097, 1148, 1174, 1217, 1246, 1273, 1272, 1304, 1291, 1314, 1290, 1251, 1287, 1290, 1306, 1253, 1247, 1218, 1206, 1210, 1208, 1188, 1254, 1192, 1189, 1197, 1156, 1087, // Tennessee
    1064, 1089, 1086, 1104, 1147, 1160, 1214, 1242, 1266, 1264, 1297, 1290, 1312, 1264, 1172, 1159, 1137, 1058, 965, 945, 856, 794, 772, 813, 788, 752, 746, 726, 732, 676, 693, // Texas
    655, 677, 713, 727, 756, 758, 779, 780, 796, 791, 748, 776, 736, 690, 663, 665, 644, 677, 550, 570, 534, 535, 550, 562, 558, 520, 540, 570, 423, 439, 407, // Utah
    1226, 1244, 1380, 1468, 1518, 1555, 1711, 1694, 1624, 1609, 1616, 1638, 1623, 1538, 1443, 1445, 1312, 1283, 1287, 1209, 1243, 1209, 1265, 1172, 1203, 1232, 1025, 977, 970, 941, 889, // Vermont
    1243, 1284, 1370, 1431, 1496, 1527, 1581, 1577, 1559, 1518, 1489, 1499, 1474, 1447, 1368, 1346, 1358, 1330, 1295, 1225, 1189, 1091, 1082, 1054, 1062, 1067, 1046, 1080, 1056, 1021, 967, // Virginia
    1145, 1115, 1175, 1166, 1199, 1232, 1297, 1339, 1316, 1221, 1223, 1205, 1198, 1157, 1119, 1091, 1121, 1075, 1091, 1040, 1041, 1001, 979, 1110, 1042, 1152, 1127, 1145, 1146, 1124, 1079, // West Virginia
    1064, 1054, 1088, 1095, 1118, 1135, 1154, 1172, 1167, 1171, 1176, 1199, 1156, 1063, 1056, 1070, 1054, 1060, 1026, 1003, 940, 955, 962, 912, 918, 935, 921, 919, 887, 844, 801, // Wisconsin
    1322, 1317, 1400, 1412, 1458, 1607, 1615, 1604, 1603, 1686, 1581, 1631, 1577, 1412, 1289, 1257, 1248, 1104, 1143, 1114, 969, 1091, 1108, 1084, 1112, 1150, 1103, 1088, 1029, 1048, 905 // Wyoming
  ];
  // Donor weights of each fit as [state index, weight] pairs at full precision.
  var FITS = {
    mlsynth: [[3, 0.15952548606007635], [4, 0.0679035078352036], [18, 0.20189148268835827], [20, 0.23560825208958514], [33, 0.33507127132677667]],
    stata: [[3, 0.161], [4, 0.068], [18, 0.202], [20, 0.235], [33, 0.334]],
    outcome: [[3, 0.014810770449670385], [4, 0.10908962424049826], [18, 0.2318399511657255], [20, 0.2049225841550874], [21, 0.04542904637542153], [33, 0.3939080236135969]],
    equal_five: [[3, 0.2], [4, 0.2], [18, 0.2], [20, 0.2], [33, 0.2]],
    utah_only: [[33, 1.0]],
    avg38: [
      [0, 0.02631578947368421], [1, 0.02631578947368421], [3, 0.02631578947368421],
      [4, 0.02631578947368421], [5, 0.02631578947368421], [6, 0.02631578947368421],
      [7, 0.02631578947368421], [8, 0.02631578947368421], [9, 0.02631578947368421],
      [10, 0.02631578947368421], [11, 0.02631578947368421], [12, 0.02631578947368421],
      [13, 0.02631578947368421], [14, 0.02631578947368421], [15, 0.02631578947368421],
      [16, 0.02631578947368421], [17, 0.02631578947368421], [18, 0.02631578947368421],
      [19, 0.02631578947368421], [20, 0.02631578947368421], [21, 0.02631578947368421],
      [22, 0.02631578947368421], [23, 0.02631578947368421], [24, 0.02631578947368421],
      [25, 0.02631578947368421], [26, 0.02631578947368421], [27, 0.02631578947368421],
      [28, 0.02631578947368421], [29, 0.02631578947368421], [30, 0.02631578947368421],
      [31, 0.02631578947368421], [32, 0.02631578947368421], [33, 0.02631578947368421],
      [34, 0.02631578947368421], [35, 0.02631578947368421], [36, 0.02631578947368421],
      [37, 0.02631578947368421], [38, 0.02631578947368421]
    ],
    placebo: [
      [[1, 0.3965771075236581], [29, 0.23735761312732892], [31, 0.17908727747677008], [33, 0.186978001872243]], // Alabama
      [[0, 0.21435588540209594], [31, 0.6986221979184045], [32, 0.08702191667949963]], // Arkansas
      [[3, 0.15952548606007635], [4, 0.0679035078352036], [18, 0.20189148268835827], [20, 0.23560825208958514], [33, 0.33507127132677667]], // California
      [[2, 0.6062904950342788], [21, 0.07339064145014444], [24, 0.2679494659677117], [32, 0.05236939754786521]], // Colorado
      [[2, 0.0029409854384084937], [5, 0.21765545669414166], [25, 0.4529808960948843], [33, 0.3264226617725654]], // Connecticut
      [[4, 0.20179614315231909], [20, 0.06791510785805589], [21, 0.14983355885591448], [25, 0.5804551901337106]], // Delaware
      [[4, 0.11732422380612006], [5, 0.12152382087569784], [29, 0.20476136878652573], [31, 0.5544278006915563], [37, 0.0019627858401001642]], // Georgia
      [[16, 0.05995138649135218], [18, 0.38999680356451166], [23, 0.17550692681676888], [33, 0.3745448831273673]], // Idaho
      [[3, 0.3241502433995461], [4, 0.25921523065521035], [12, 0.03599917701038969], [20, 0.026263342779412998], [21, 0.030432272526589095], [27, 0.13191035555039515], [32, 0.14374354073287646], [35, 0.048285837345580326]], // Illinois
      [[4, 0.0011122622307547074], [23, 0.24770559131838027], [28, 0.21623734452358098], [31, 0.11857913300643143], [33, 0.008884407665265116], [35, 0.2728041938759492], [36, 0.13467706737963836]], // Indiana
      [[1, 0.10730214269907726], [4, 0.23003125351345557], [7, 0.05355308175833863], [16, 0.09848553330011184], [21, 0.007207780182419598], [22, 0.28234109822595105], [26, 0.06655856535341813], [38, 0.15452054496722775]], // Iowa
      [[3, 0.06549433135461205], [4, 0.1704537207319946], [25, 0.09228133629219863], [26, 0.2766128051935533], [33, 0.16086677706346622], [35, 0.23429102936417523]], // Kansas
      [[21, 0.3205658094817066], [23, 0.4500155865914082], [35, 0.22941860392688523]], // Kentucky
      [[12, 0.05396825719400604], [16, 0.2387011629173865], [21, 0.04407760139857507], [24, 0.03693435300899188], [32, 0.5043948185152805], [34, 0.12192380696576015]], // Louisiana
      [[1, 0.28931132942276605], [4, 0.11044485296023313], [20, 0.048234468831570065], [21, 0.09551221215471282], [28, 0.110334518210286], [36, 0.346162618420432]], // Maine
      [[4, 0.39941860636501975], [16, 0.06478009057506956], [32, 0.33179713492211244], [33, 0.11878459711066668], [36, 0.08521957102713158]], // Minnesota
      [[0, 0.17905923616307584], [13, 0.01412221589632873], [29, 0.4604281772223133], [32, 0.2333849858218445], [33, 0.11300538489643769]], // Mississippi
      [[1, 0.21539933067623607], [7, 0.07818295268774172], [12, 0.06983538956319668], [20, 0.11667273041806436], [25, 0.36748000814280357], [31, 0.15242958851195743]], // Missouri
      [[3, 0.17967608101769378], [7, 0.16419931612802885], [21, 0.058681835861573564], [22, 0.4321451736005116], [24, 0.1652975933921923]], // Montana
      [[2, 0.02649648781070596], [4, 0.08227442076561875], [7, 0.033256133868259014], [9, 0.021534920516411746], [18, 0.3362543441069404], [27, 0.2808102319243274], [33, 0.12218833046487708], [37, 0.09718513054285957]], // Nebraska
      [[2, 0.4040522784037875], [21, 0.2868989541297139], [23, 0.30904876746649856]], // Nevada
      [[12, 0.7011290966050508], [23, 0.29887090339494915]], // New Hampshire
      [[16, 0.1189926696550578], [18, 0.38475824113720375], [33, 0.4138193898363702], [37, 0.08242969937136832]], // New Mexico
      [[7, 0.029983768368121527], [12, 0.20277932324006415], [20, 0.6156464166501813], [21, 0.15159049174163308]], // North Carolina
      [[18, 0.27116064707867876], [26, 0.4874637535664602], [33, 0.241375599354861]], // North Dakota
      [[1, 0.351775403557692], [4, 0.25732763927484564], [5, 0.27804641433966454], [31, 0.1128505428277978]], // Ohio
      [[7, 0.006294808540587739], [12, 0.1490715618997457], [21, 0.007837713272055777], [24, 0.2824805003485618], [32, 0.5543154159390491]], // Oklahoma
      [[1, 0.35702084621201086], [4, 0.09778749985726616], [7, 0.14448955332422628], [25, 0.2398708157073264], [32, 0.0857484482323798], [33, 0.07508283666679053]], // Pennsylvania
      [[5, 0.49099518089390515], [9, 0.12271167968056015], [12, 0.08252375425466627], [31, 0.3037693851708686]], // Rhode Island
      [[12, 0.10857419998885257], [16, 0.28449502476963057], [31, 0.3829012485080587], [33, 0.06695936438071601], [35, 0.1570701623527422]], // South Carolina
      [[7, 0.0111747672797394], [12, 0.04424787112197856], [16, 0.024025269475653744], [22, 0.3350993799964091], [26, 0.13536812893410374], [31, 0.05503020487915495], [33, 0.173453378088716], [36, 0.22160100022424453]], // South Dakota
      [[1, 0.6656652701748237], [6, 0.3307701566180739], [12, 0.0035645732071023016]], // Tennessee
      [[1, 0.1796707450534241], [4, 0.23873667377731506], [24, 0.3480917701829571], [26, 0.23350081098630376]], // Texas
      [[22, 1.0]], // Utah
      [[12, 0.36563945388068025], [13, 0.0007935829974342505], [21, 0.0001462365112681006], [29, 0.06660110677173016], [32, 0.5668196198388872]], // Vermont
      [[7, 0.11380626678772748], [9, 0.14252253638390242], [12, 0.1466130628045598], [17, 0.024039521710435843], [23, 0.04841729066000627], [29, 0.5246013216533684]], // Virginia
      [[1, 0.1468799772541775], [4, 0.27848314170907246], [7, 0.10612993220755078], [9, 0.2725814866205122], [14, 0.032134987392368995], [23, 0.009051695674129074], [33, 0.15473877914218903]], // West Virginia
      [[4, 0.34122352992352223], [16, 0.028185314703731184], [22, 0.14122353799831594], [28, 0.24616129725267666], [31, 0.07749494404192434], [33, 0.16571137607982964]], // Wisconsin
      [[3, 0.5916737699277019], [12, 0.21835288158773786], [21, 0.07739663004458294], [24, 0.0860554242035264], [26, 0.0265212942364509]] // Wyoming
    ],
    intime: {
      1985: [[4, 0.34846734601542695], [20, 0.3005799572918593], [33, 0.35095269669271356]],
      1986: [[3, 0.011802587373579563], [4, 0.3089657981258918], [20, 0.3077817942109549], [33, 0.3714498202895736]],
      1987: [[3, 0.036692895510193155], [4, 0.26964196204782864], [20, 0.3087188143675241], [33, 0.3849463280744542]],
      1988: [[3, 0.20928949355082713], [4, 0.13895847298881156], [20, 0.26856096044022704], [33, 0.38319107302013417]]
    },
    loo: {
      'Utah': [[3, 0.12294421144617855], [4, 0.06596827867496544], [20, 0.19688027040450218], [22, 0.6142072394743538]],
      'Nevada': [[3, 0.12415815842382234], [4, 0.13909267792148863], [21, 0.18545883332306726], [33, 0.5512903303316218]],
      'Montana': [[3, 0.2730705515961927], [4, 0.08763575080931486], [20, 0.25527278175030205], [33, 0.38402091584419035]],
      'Colorado': [[4, 0.14847561730546027], [18, 0.2423501507070219], [20, 0.26726325335568557], [33, 0.3419109786318324]],
      'Connecticut': [[3, 0.20761034450553464], [15, 0.0354783790922903], [18, 0.19073351289037416], [20, 0.22748989636159275], [33, 0.33868786715020827]]
    }
  };
  var GAP_OVERRIDES = {};
  var CUT_STOPS = [1, 1.5, 2, 3, 5, 10, 20, null];
  var CUT_DEFAULT = 2;
  var FAKE_YEARS = [1985, 1986, 1987, 1988];
  var FAKE_DEFAULT = 1985;
  var LOO_ORDER = ['Utah', 'Nevada', 'Montana', 'Colorado', 'Connecticut'];
  // END GENERATED DATA

  /* ------------------------------------------------------------------ */
  /* Constants and the table of display formats                          */
  /* ------------------------------------------------------------------ */

  var NS = STATES.length;
  var NPOST = T - T0;
  var TREAT_YEAR = YEAR0 + T0;
  var LAST_YEAR = YEAR0 + T - 1;
  var MINUS = '−';
  var TIMES = '×';
  // The en dash is built from its code point and joins two years only (1970–1988).
  var NDASH = String.fromCharCode(8211);
  var SVGNS = 'http://www.w3.org/2000/svg';
  // Decimals for each kind of number; every readout and every test uses this table.
  var DP = { att: 2, gap: 2, rmspe: 3, p: 3, ratio: 1, weight: 3 };
  var POS_TOL = 1e-6;   // a weight above this value counts as positive, as in script.py
  var FLAG_FACTOR = 2;  // the mixer warns when the pre-treatment RMSE doubles
  var PRESET_KEYS = ['mlsynth', 'stata', 'outcome', 'equal_five', 'utah_only'];
  var PRESET_STATUS = {
    mlsynth: 'mlsynth weights',
    stata: 'Stata weights',
    outcome: 'outcome-only weights',
    equal_five: 'equal fifths',
    utah_only: 'all weight on Utah'
  };
  var SIXTH_DEFAULT = 'New Hampshire';
  var TABS = ['mixer', 'cutoff', 'intime', 'loo'];

  /* ------------------------------------------------------------------ */
  /* Numerics: pure functions with no access to the page                 */
  /* ------------------------------------------------------------------ */

  if (CIG10.length !== NS * T) throw new Error('sc-lab: the sales block has the wrong size');
  var SALES = new Array(NS * T);
  for (var i0 = 0; i0 < SALES.length; i0++) SALES[i0] = Math.fround(CIG10[i0] / 10);

  function y(s, t) { return SALES[s * T + t]; }
  function row(s) { return SALES.slice(s * T, s * T + T); }
  function zeros(n) {
    var a = new Array(n);
    for (var i = 0; i < n; i++) a[i] = 0;
    return a;
  }
  function stateIndex(name) {
    var k = STATES.indexOf(name);
    if (k < 0) throw new Error('sc-lab: unknown state ' + name);
    return k;
  }
  function dense(pairs) {
    var w = zeros(NS);
    for (var i = 0; i < pairs.length; i++) w[pairs[i][0]] = pairs[i][1];
    return w;
  }

  // Synthetic path of a dense weight vector, summed over donors in index order.
  function synth(w) {
    var out = zeros(T);
    for (var j = 0; j < NS; j++) {
      if (!w[j]) continue;
      for (var t = 0; t < T; t++) out[t] += w[j] * SALES[j * T + t];
    }
    return out;
  }
  function gapOf(unit, w) {
    var s = synth(w), g = new Array(T);
    for (var t = 0; t < T; t++) g[t] = SALES[unit * T + t] - s[t];
    return g;
  }
  // Gap of a stored fit; the generator embeds a gap only when the weights cannot rebuild it.
  function fitGap(key, unit, pairs) {
    if (Object.prototype.hasOwnProperty.call(GAP_OVERRIDES, key)) return GAP_OVERRIDES[key].slice();
    return gapOf(unit, dense(pairs));
  }
  function meanOf(a, lo, hi) {
    var s = 0;
    for (var i = lo; i < hi; i++) s += a[i];
    return s / (hi - lo);
  }
  function meanSq(a, lo, hi) {
    var s = 0;
    for (var i = lo; i < hi; i++) s += a[i] * a[i];
    return s / (hi - lo);
  }

  // Pre-period statistics use the years before index t0 (default 1989).
  function summarize(g, t0) {
    var k = t0 == null ? T0 : t0;
    var pre = meanSq(g, 0, k), post = meanSq(g, T0, T);
    return {
      preMSPE: pre, postMSPE: post, ratio: post / pre, rmspeRatio: Math.sqrt(post / pre),
      preRMSPE: Math.sqrt(pre), att: meanOf(g, T0, T), gap2000: g[T - 1]
    };
  }

  // Shares become weights by division by their sum; a zero sum has no weights.
  function normalize(shares) {
    var sum = 0, j;
    for (j = 0; j < NS; j++) sum += shares[j];
    if (!(sum > 0)) return null;
    var w = new Array(NS);
    for (j = 0; j < NS; j++) w[j] = shares[j] / sum;
    return w;
  }

  function mixer(w) {
    var syn = synth(w), g = new Array(T);
    for (var t = 0; t < T; t++) g[t] = SALES[CA * T + t] - syn[t];
    var s = summarize(g);
    s.weights = w;
    s.synthetic = syn;
    s.gap = g;
    return s;
  }
  function mixShares(shares) {
    var w = normalize(shares);
    return w ? mixer(w) : null;
  }
  function presetWeights(key) {
    if (PRESET_KEYS.indexOf(key) < 0 && key !== 'avg38') throw new Error('sc-lab: unknown preset ' + key);
    return dense(FITS[key]);
  }

  function positiveWeights(w) {
    var out = [];
    for (var j = 0; j < NS; j++) if (w[j] > POS_TOL) out.push([STATES[j], w[j]]);
    out.sort(function (a, b) { return b[1] - a[1]; });
    return out;
  }

  var placeboCache = null;
  // One fit per state, each state treated in turn; California keeps the mlsynth fit.
  function placeboUnits() {
    if (placeboCache) return placeboCache;
    var units = [], u;
    for (u = 0; u < NS; u++) {
      var key = u === CA ? 'mlsynth' : 'placebo:' + STATES[u];
      var g = fitGap(key, u, u === CA ? FITS.mlsynth : FITS.placebo[u]);
      var s = summarize(g);
      units.push({ unit: u, state: STATES[u], gap: g, preMSPE: s.preMSPE, postMSPE: s.postMSPE, ratio: s.ratio });
    }
    for (u = 0; u < NS; u++) units[u].preRel = units[u].preMSPE / units[CA].preMSPE;
    placeboCache = units;
    return units;
  }

  // Placebo test with cutoff c (null keeps every state), using the tie rules of synth2.
  function placebo(c) {
    var U = placeboUnits(), ca = U[CA], kept = [], excluded = [], u, k, t;
    for (u = 0; u < NS; u++) {
      if (u === CA || c == null || U[u].preRel <= c) kept.push(u);
      else excluded.push(STATES[u]);
    }
    var n = kept.length, rank = 0;
    for (k = 0; k < n; k++) if (U[kept[k]].ratio >= ca.ratio) rank++;
    var two = [], right = [], left = [], counts = { two: [], right: [], left: [] };
    for (t = T0; t < T; t++) {
      var g1 = ca.gap[t], a = 0, b = 0, d = 0;
      for (k = 0; k < n; k++) {
        var g = U[kept[k]].gap[t];
        if (Math.abs(g) >= Math.abs(g1)) a++;
        if (g >= g1) b++;
        if (g <= g1) d++;
      }
      counts.two.push(a); counts.right.push(b); counts.left.push(d);
      two.push(a / n); right.push(b / n); left.push(d / n);
    }
    var leftMinYears = [];
    for (k = 0; k < NPOST; k++) if (counts.left[k] === 1) leftMinYears.push(TREAT_YEAR + k);
    return {
      cutoff: c, kept: kept, excluded: excluded, n: n, rank: rank, p: rank / n, minP: 1 / n,
      two: two, right: right, left: left, counts: counts,
      leftMinYears: leftMinYears, nLeftMin: leftMinYears.length
    };
  }

  // In-time placebo with fake start year F; the fit uses only the years before F.
  function intime(F) {
    if (FAKE_YEARS.indexOf(F) < 0) throw new Error('sc-lab: no in-time fit for ' + F);
    var pairs = FITS.intime[F], w = dense(pairs), g = fitGap('intime:' + F, CA, pairs);
    var k = F - YEAR0, fake = g.slice(k, T0), maxFake = 0, maxYear = F, syn = new Array(T);
    for (var i = 0; i < fake.length; i++) {
      if (Math.abs(fake[i]) > Math.abs(maxFake)) { maxFake = fake[i]; maxYear = F + i; }
    }
    for (var t = 0; t < T; t++) syn[t] = SALES[CA * T + t] - g[t];
    return {
      fakeYear: F, weights: w, positive: positiveWeights(w), gap: g, synthetic: syn,
      preRMSPE: Math.sqrt(meanSq(g, 0, k)), fakeGaps: fake, fakeGapMean: meanOf(g, k, T0),
      postGapMean: meanOf(g, T0, T), maxFake: maxFake, maxFakeYear: maxYear
    };
  }

  // Leave-one-out refit without one donor; 'none' returns the baseline fit.
  function loo(name) {
    var base = !name || name === 'none';
    if (!base && LOO_ORDER.indexOf(name) < 0) throw new Error('sc-lab: no refit without ' + name);
    var pairs = base ? FITS.mlsynth : FITS.loo[name];
    var g = fitGap(base ? 'mlsynth' : 'loo:' + name, CA, pairs), s = summarize(g), w = dense(pairs);
    return {
      dropped: base ? 'none' : name, weights: w, positive: positiveWeights(w), gap: g,
      att: s.att, gap2000: g[T - 1], gap1997: g[1997 - YEAR0], preRMSE: s.preRMSPE
    };
  }

  var bandCache = null;
  function looBand() {
    if (bandCache) return bandCache;
    var fits = LOO_ORDER.map(function (d) { return loo(d); }), lo = [], hi = [], t, k;
    for (t = T0; t < T; t++) {
      var a = Infinity, b = -Infinity;
      for (k = 0; k < fits.length; k++) { a = Math.min(a, fits[k].gap[t]); b = Math.max(b, fits[k].gap[t]); }
      lo.push(a); hi.push(b);
    }
    function argBy(key, better) {
      var best = 0;
      for (var i = 1; i < fits.length; i++) if (better(fits[i][key], fits[best][key])) best = i;
      return fits[best];
    }
    var less = function (a, b) { return a < b; }, more = function (a, b) { return a > b; };
    var g0 = argBy('gap2000', less), g1 = argBy('gap2000', more), a0 = argBy('att', less), a1 = argBy('att', more);
    bandCache = {
      fits: fits, lo: lo, hi: hi,
      gap2000Range: [g0.gap2000, g1.gap2000], attRange: [a0.att, a1.att],
      minGap2000State: g0.dropped, maxGap2000State: g1.dropped,
      minAttState: a0.dropped, maxAttState: a1.dropped
    };
    return bandCache;
  }

  /* ------------------------------------------------------------------ */
  /* Text: every string that a readout shows                             */
  /* ------------------------------------------------------------------ */

  function fmt(v, dp) {
    var s = Math.abs(v).toFixed(dp);
    if (Number(s) === 0) return (0).toFixed(dp);
    return (v < 0 ? MINUS : '') + s;
  }
  function span(a, b) { return a === b ? String(a) : a + NDASH + b; }
  function weightList(pos) {
    return pos.map(function (p) { return p[0] + ' ' + fmt(p[1], DP.weight); }).join(', ');
  }
  function cutLabel(c) { return c == null ? 'No cutoff' : String(c) + TIMES; }
  function cutWords(c) {
    if (c == null) return 'No cutoff';
    if (c === 1) return 'Cutoff equal to the pre-treatment MSPE of California';
    return 'Cutoff ' + String(c) + ' times the pre-treatment MSPE of California';
  }

  function mixerText(R) {
    return {
      pre: fmt(R.preRMSPE, DP.rmspe), att: fmt(R.att, DP.att),
      gap2000: fmt(R.gap2000, DP.gap), ratio: fmt(R.ratio, DP.ratio)
    };
  }
  function cutoffText(r, year) {
    var k = year - TREAT_YEAR;
    return {
      cut: cutLabel(r.cutoff), kept: r.n + ' of ' + NS, rank: r.rank + ' of ' + r.n,
      p: fmt(r.p, DP.p), minP: fmt(r.minP, DP.p),
      two: fmt(r.two[k], DP.p), right: fmt(r.right[k], DP.p), left: fmt(r.left[k], DP.p),
      leftMin: r.nLeftMin + ' of ' + NPOST,
      excluded: r.excluded.length ? r.excluded.join(', ') : 'None',
      excludedCount: String(r.excluded.length)
    };
  }
  function intimeText(r) {
    return {
      weights: weightList(r.positive), pre: fmt(r.preRMSPE, DP.rmspe),
      preSpan: 'fit over ' + span(YEAR0, r.fakeYear - 1),
      fake: r.fakeGaps.map(function (g) { return fmt(g, DP.gap); }).join(', '),
      fakeSpan: span(r.fakeYear, TREAT_YEAR - 1),
      fakeMean: fmt(r.fakeGapMean, DP.gap), maxFake: fmt(r.maxFake, DP.gap) + ' in ' + r.maxFakeYear,
      postMean: fmt(r.postGapMean, DP.gap)
    };
  }
  function looText(r, band) {
    return {
      fit: r.dropped === 'none' ? 'Baseline' : 'Without ' + r.dropped,
      att: fmt(r.att, DP.att), gap2000: fmt(r.gap2000, DP.gap), pre: fmt(r.preRMSE, DP.rmspe),
      weights: weightList(r.positive),
      attRange: fmt(band.attRange[0], DP.att) + ' to ' + fmt(band.attRange[1], DP.att),
      gapRange: fmt(band.gap2000Range[0], DP.gap) + ' to ' + fmt(band.gap2000Range[1], DP.gap)
    };
  }

  var BASE = mixer(dense(FITS.mlsynth));
  var AVG = mixer(dense(FITS.avg38));

  /* ------------------------------------------------------------------ */
  /* SVG helpers                                                         */
  /* ------------------------------------------------------------------ */

  function niceStep(span0, target) {
    var raw = span0 / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }
  function niceDomain(lo, hi, target) {
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var st = niceStep(hi - lo, target);
    return { lo: Math.floor(lo / st) * st, hi: Math.ceil(hi / st) * st, step: st };
  }
  function extent(arrays) {
    var lo = Infinity, hi = -Infinity;
    arrays.forEach(function (a) {
      for (var i = 0; i < a.length; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i]; }
    });
    return [lo, hi];
  }
  function scale(dom, r0, r1) {
    var k = (r1 - r0) / (dom.hi - dom.lo);
    return function (v) { return r0 + (v - dom.lo) * k; };
  }
  function svgEl(tag, cls) {
    var e = document.createElementNS(SVGNS, tag);
    if (cls) e.setAttribute('class', cls);
    return e;
  }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  // Every hook must exist: a missing element stops the lab with a console error
  // instead of leaving a silent gap in a chart or a readout.
  function pick(root, sel) {
    var el = root.querySelector(sel);
    if (!el) throw new Error('sc-lab: missing element ' + sel);
    return el;
  }
  function setText(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }
  function setAttr(el, name, value) {
    var v = String(value);
    if (el && el.getAttribute(name) !== v) el.setAttribute(name, v);
  }
  function r1(v) { return Math.round(v * 10) / 10; }
  function tickDp(step) { return step >= 1 ? 0 : step >= 0.1 ? 1 : 2; }

  // A chart reads its plotting area from the frame rectangle of the markup.
  function Chart(svg, yearLo, yearHi, inset) {
    var r = pick(svg, '[data-frame="frame"]');
    this.svg = svg;
    this.x0 = Number(r.getAttribute('x'));
    this.y0 = Number(r.getAttribute('y'));
    this.x1 = this.x0 + Number(r.getAttribute('width'));
    this.y1 = this.y0 + Number(r.getAttribute('height'));
    this.xs = scale({ lo: yearLo, hi: yearHi }, this.x0 + inset, this.x1 - inset);
  }
  Chart.prototype.q = function (sel) { return pick(this.svg, sel); };
  Chart.prototype.yTicks = function (dom, ys) {
    var g = this.q('[data-ticks="y"]'), dp = tickDp(dom.step);
    clear(g);
    for (var v = dom.lo; v <= dom.hi + dom.step * 1e-6; v += dom.step) {
      var yy = r1(ys(v)), ln = svgEl('path', 'sl-gridline'), tx = svgEl('text');
      ln.setAttribute('d', 'M' + this.x0 + ' ' + yy + 'L' + this.x1 + ' ' + yy);
      g.appendChild(ln);
      tx.setAttribute('x', this.x0 - 5);
      tx.setAttribute('y', yy);
      tx.setAttribute('dy', '0.35em');
      tx.setAttribute('text-anchor', 'end');
      tx.textContent = fmt(Math.abs(v) < dom.step * 1e-6 ? 0 : v, dp);
      g.appendChild(tx);
    }
  };
  Chart.prototype.xTicks = function (years) {
    var g = this.q('[data-ticks="x"]');
    clear(g);
    for (var i = 0; i < years.length; i++) {
      var tx = svgEl('text');
      tx.setAttribute('x', r1(this.xs(years[i])));
      tx.setAttribute('y', this.y1 + 3);
      tx.setAttribute('dy', '1em');
      tx.setAttribute('text-anchor', 'middle');
      tx.textContent = String(years[i]);
      g.appendChild(tx);
    }
  };
  Chart.prototype.path = function (vals, firstYear, ys) {
    var d = '';
    for (var i = 0; i < vals.length; i++) d += (i ? 'L' : 'M') + r1(this.xs(firstYear + i)) + ' ' + r1(ys(vals[i]));
    return d;
  };
  Chart.prototype.vline = function (year) {
    var x = r1(this.xs(year));
    return 'M' + x + ' ' + this.y0 + 'L' + x + ' ' + this.y1;
  };
  Chart.prototype.hline = function (yy) {
    var v = r1(yy);
    return 'M' + this.x0 + ' ' + v + 'L' + this.x1 + ' ' + v;
  };
  // Shaded band between two years, drawn as a path: the production minifier
  // removes a rect whose width is zero, so the markup holds a path hook instead.
  Chart.prototype.shade = function (el, yearA, yearB) {
    var xa = r1(Math.max(this.x0, this.xs(yearA))), xb = r1(Math.min(this.x1, this.xs(yearB)));
    setAttr(el, 'd', xb > xa ? 'M' + xa + ' ' + this.y0 + 'H' + xb + 'V' + this.y1 + 'H' + xa + 'Z' : '');
  };
  var YEAR_TICKS = [1970, 1975, 1980, 1985, 1990, 1995, 2000];

  /* ------------------------------------------------------------------ */
  /* Tab 1: the weight mixer                                             */
  /* ------------------------------------------------------------------ */

  function MixerLab(lab, root) {
    var self = this, k;
    var q = function (s) { return pick(root, s); };
    this.lab = lab;
    this.root = root;
    this.presetBtns = Array.prototype.slice.call(root.querySelectorAll('[data-preset]'));
    this.inputs = [];
    this.outs = [];
    this.slots = [];
    for (k = 0; k < 6; k++) {
      var inp = q('input[data-share="' + k + '"]');
      this.inputs.push(inp);
      this.outs.push(q('output[data-share-out="' + k + '"]'));
      this.slots.push(k < 5 ? stateIndex(inp.getAttribute('data-state')) : stateIndex(SIXTH_DEFAULT));
    }
    this.sixthSel = q('select[data-sixth="sixth"]');
    this.sixthLabel = q('[data-sixth-label="label"]');
    clear(this.sixthSel);
    STATES.forEach(function (name, j) {
      if (j === CA || self.slots.slice(0, 5).indexOf(j) >= 0) return;
      var opt = document.createElement('option');
      opt.value = String(j);
      opt.textContent = name;
      self.sixthSel.appendChild(opt);
    });
    this.sixthSel.value = String(this.slots[5]);
    this.avgBox = q('input[data-toggle="avg"]');
    this.paths = new Chart(q('svg[data-plot="mixer-paths"]'), YEAR0, LAST_YEAR, 6);
    this.gapc = new Chart(q('svg[data-plot="mixer-gap"]'), YEAR0, LAST_YEAR, 6);
    this.paths.xTicks(YEAR_TICKS);
    this.gapc.xTicks(YEAR_TICKS);
    this.avgLegend = q('[data-legend="avg"]');
    this.avgBlock = q('[data-avg="avg"]');
    this.out = {};
    ['pre', 'att', 'gap2000', 'ratio', 'avgPre', 'avgAtt', 'avgGap2000', 'avgRatio', 'flag', 'flagSub'].forEach(function (key) {
      self.out[key] = q('[data-out="mx-' + key + '"]');
    });
    this.flag = q('[data-flag="mixer"]');
    this.allZero = false;
    this.applyPreset('mlsynth');
    this.bind();
  }

  MixerLab.prototype.bind = function () {
    var self = this;
    this.presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.applyPreset(btn.getAttribute('data-preset'));
        self.lab.announceSoon();
      });
    });
    this.inputs.forEach(function (inp, k) {
      inp.addEventListener('input', function () {
        // Exact until touched: only the moved slider leaves its preset value.
        self.preset = null;
        self.shares[self.slots[k]] = Number(inp.value) / 100;
        self.lab.schedule(self);
      });
      inp.addEventListener('change', function () { self.lab.announceSoon(); });
    });
    this.sixthSel.addEventListener('change', function () {
      self.setSixth(Number(self.sixthSel.value));
      self.lab.schedule(self);
      self.lab.announceSoon();
    });
    this.avgBox.addEventListener('change', function () {
      self.lab.schedule(self);
      self.lab.announceSoon();
    });
    pick(this.root, '[data-act="reset-mixer"]').addEventListener('click', function () {
      self.setSixth(stateIndex(SIXTH_DEFAULT));
      self.avgBox.checked = false;
      self.applyPreset('mlsynth');
      self.lab.announceSoon();
    });
  };

  // A preset applies its weights at full precision; a weight outside the five
  // fixed donors moves into the sixth slot.
  MixerLab.prototype.applyPreset = function (key) {
    var w = presetWeights(key), fixed = this.slots.slice(0, 5);
    for (var j = 0; j < NS; j++) {
      if (w[j] > 0 && fixed.indexOf(j) < 0 && j !== this.slots[5]) this.setSixth(j);
    }
    this.shares = w;
    this.preset = key;
    this.syncSliders();
    this.lab.schedule(this);
  };

  MixerLab.prototype.setSixth = function (j) {
    var old = this.slots[5];
    if (j === old) return;
    if (this.shares) {
      if (this.shares[old] !== 0) this.preset = null;
      this.shares[j] = this.shares[old];
      this.shares[old] = 0;
    }
    this.slots[5] = j;
    this.sixthSel.value = String(j);
    setText(this.sixthLabel, STATES[j]);
  };

  MixerLab.prototype.syncSliders = function () {
    for (var k = 0; k < 6; k++) {
      var pct = Math.round(this.shares[this.slots[k]] * 200) / 2;
      this.inputs[k].value = String(Math.min(100, Math.max(0, pct)));
    }
  };

  MixerLab.prototype.weights = function () {
    return this.preset ? presetWeights(this.preset) : normalize(this.shares);
  };

  MixerLab.prototype.status = function () {
    return 'The data of this post, ' + (this.preset ? PRESET_STATUS[this.preset] : 'weights set by hand');
  };

  MixerLab.prototype.render = function () {
    var w = this.weights(), k;
    this.allZero = !w;
    if (w) this.lastW = w;
    var R = mixer(this.lastW);
    this.last = R;
    for (k = 0; k < 6; k++) {
      var wk = w ? w[this.slots[k]] : 0;
      setText(this.outs[k], fmt(wk, DP.weight));
      setAttr(this.inputs[k], 'aria-valuetext', 'Share ' + this.inputs[k].value + ', weight ' + fmt(wk, DP.weight));
    }
    var self = this;
    this.presetBtns.forEach(function (btn) {
      setAttr(btn, 'aria-pressed', btn.getAttribute('data-preset') === self.preset ? 'true' : 'false');
    });
    var showAvg = this.avgBox.checked;
    this.draw(R, showAvg);
    var tx = mixerText(R), ta = mixerText(AVG);
    setText(this.out.pre, tx.pre);
    setText(this.out.att, tx.att);
    setText(this.out.gap2000, tx.gap2000);
    setText(this.out.ratio, tx.ratio);
    setText(this.out.avgPre, ta.pre);
    setText(this.out.avgAtt, ta.att);
    setText(this.out.avgGap2000, ta.gap2000);
    setText(this.out.avgRatio, ta.ratio);
    if (showAvg) { this.avgBlock.removeAttribute('hidden'); this.avgLegend.removeAttribute('hidden'); }
    else { this.avgBlock.setAttribute('hidden', ''); this.avgLegend.setAttribute('hidden', ''); }

    var base = fmt(BASE.preRMSPE, DP.rmspe), state, msg, sub;
    if (this.allZero) {
      state = 'bias';
      msg = 'All six shares are zero.';
      sub = 'Raise at least one slider to rebuild synthetic California. The charts and readouts keep the last valid weights.';
    } else if (this.preset === 'mlsynth') {
      state = 'ok';
      msg = 'These are the weights that mlsynth chose, so every readout matches the post.';
      sub = 'Move a slider or pick another preset to see how the fit and the effect respond to the weights.';
    } else if (R.preRMSPE > FLAG_FACTOR * BASE.preRMSPE) {
      state = 'bias';
      msg = 'The synthetic path misses California before 1989.';
      sub = 'The pre-treatment RMSE of ' + tx.pre + ' is more than twice that of the mlsynth fit (' + base +
        '). The gaps from 1989 onward therefore mix the effect of the program with fitting error.';
    } else {
      state = 'ok';
      msg = 'The synthetic path tracks California reasonably well before 1989.';
      sub = 'The pre-treatment RMSE of ' + tx.pre + ' is at most twice that of the mlsynth fit (' + base +
        '), so the weights pass this first check. A close fit is necessary for a credible counterfactual, but it is not sufficient.';
    }
    setAttr(this.flag, 'data-state', state);
    setText(this.out.flag, msg);
    setText(this.out.flagSub, sub);
  };

  MixerLab.prototype.draw = function (R, showAvg) {
    var P = this.paths, G = this.gapc, ca = row(CA);
    var series = [ca, R.synthetic];
    if (showAvg) series.push(AVG.synthetic);
    var e = extent(series), dom = niceDomain(e[0], e[1], 5), ys = scale(dom, P.y1, P.y0);
    P.yTicks(dom, ys);
    P.shade(P.q('[data-shade="pre"]'), YEAR0 - 1, TREAT_YEAR);
    setAttr(P.q('[data-line="onset"]'), 'd', P.vline(TREAT_YEAR));
    setAttr(P.q('[data-line="ca"]'), 'd', P.path(ca, YEAR0, ys));
    setAttr(P.q('[data-line="synth"]'), 'd', P.path(R.synthetic, YEAR0, ys));
    setAttr(P.q('[data-line="avg"]'), 'd', showAvg ? P.path(AVG.synthetic, YEAR0, ys) : '');

    var eg = extent([R.gap, [0]]), gd = niceDomain(eg[0], eg[1], 4), gs = scale(gd, G.y1, G.y0);
    G.yTicks(gd, gs);
    G.shade(G.q('[data-shade="pre"]'), YEAR0 - 1, TREAT_YEAR);
    setAttr(G.q('[data-line="zero"]'), 'd', G.hline(gs(0)));
    setAttr(G.q('[data-line="onset"]'), 'd', G.vline(TREAT_YEAR));
    setAttr(G.q('[data-line="gap"]'), 'd', G.path(R.gap, YEAR0, gs));
  };

  MixerLab.prototype.announcement = function () {
    var tx = mixerText(this.last);
    var head = this.allZero ? 'All shares are zero; the readouts keep the last valid weights. ' : '';
    return head + 'Pre-treatment RMSE ' + tx.pre + '. ATT ' + tx.att + '. Gap in 2000 ' + tx.gap2000 +
      '. MSPE ratio ' + tx.ratio + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Tab 2: the placebo cutoff                                           */
  /* ------------------------------------------------------------------ */

  function CutoffLab(lab, root) {
    var self = this;
    var q = function (s) { return pick(root, s); };
    this.lab = lab;
    this.root = root;
    this.cutInp = q('input[data-param="cut"]');
    this.yearInp = q('input[data-param="year"]');
    this.exclBox = q('input[data-toggle="excluded"]');
    this.gaps = new Chart(q('svg[data-plot="cutoff-gaps"]'), YEAR0, LAST_YEAR, 6);
    this.pc = new Chart(q('svg[data-plot="cutoff-p"]'), TREAT_YEAR, LAST_YEAR, 14);
    this.gaps.xTicks(YEAR_TICKS);
    this.pc.xTicks([1990, 1992, 1994, 1996, 1998, 2000]);
    this.keptG = this.gaps.q('[data-lines="kept"]');
    this.exclG = this.gaps.q('[data-lines="excluded"]');
    this.unitPaths = [];
    for (var u = 0; u < NS; u++) this.unitPaths.push(u === CA ? null : svgEl('path', 'sl-line sl-line-placebo'));
    this.dots = [];
    var dg = this.pc.q('[data-dots="p"]');
    for (var k = 0; k < NPOST; k++) {
      var c = svgEl('circle', 'sl-pdot');
      c.setAttribute('r', '4');
      dg.appendChild(c);
      this.dots.push(c);
    }
    this.pDesc = this.pc.q('[data-desc="p"]');
    this.out = {};
    ['cut', 'year', 'kept', 'keptSub', 'rank', 'p', 'minP', 'two', 'right', 'left', 'leftMin', 'excluded',
      'excludedCount', 'keptLegend', 'flag', 'flagSub'].forEach(function (key) {
      self.out[key] = q('[data-out="ct-' + key + '"]');
    });
    this.yearLabels = Array.prototype.slice.call(root.querySelectorAll('[data-out="ct-yearLabel"]'));
    this.exclLegend = q('[data-legend="excluded"]');
    this.flag = q('[data-flag="cutoff"]');
    this.bind();
  }

  CutoffLab.prototype.bind = function () {
    var self = this;
    [this.cutInp, this.yearInp].forEach(function (inp) {
      inp.addEventListener('input', function () { self.lab.schedule(self); });
      inp.addEventListener('change', function () { self.lab.announceSoon(); });
    });
    this.exclBox.addEventListener('change', function () { self.lab.schedule(self); self.lab.announceSoon(); });
    pick(this.root, '[data-act="reset-cutoff"]').addEventListener('click', function () {
      self.cutInp.value = String(CUT_STOPS.indexOf(CUT_DEFAULT));
      self.yearInp.value = String(LAST_YEAR);
      self.exclBox.checked = false;
      self.lab.schedule(self);
      self.lab.announceSoon();
    });
  };

  CutoffLab.prototype.cutoff = function () {
    var i = Math.round(Number(this.cutInp.value));
    return CUT_STOPS[Math.min(CUT_STOPS.length - 1, Math.max(0, i))];
  };
  CutoffLab.prototype.year = function () {
    return Math.min(LAST_YEAR, Math.max(TREAT_YEAR, Math.round(Number(this.yearInp.value))));
  };
  CutoffLab.prototype.status = function () {
    return 'The data of this post, ' + NS + ' fits: California and ' + (NS - 1) + ' placebo states';
  };

  CutoffLab.prototype.render = function () {
    var c = this.cutoff(), year = this.year(), r = placebo(c), tx = cutoffText(r, year);
    this.last = { r: r, year: year, tx: tx };
    setText(this.out.cut, tx.cut);
    setAttr(this.cutInp, 'aria-valuetext', cutWords(c));
    setText(this.out.year, String(year));
    this.yearLabels.forEach(function (el) { setText(el, String(year)); });
    setText(this.out.kept, tx.kept);
    setText(this.out.keptSub, 'California and ' + (r.n - 1) + ' placebo states');
    setText(this.out.rank, tx.rank);
    setText(this.out.p, tx.p);
    setText(this.out.minP, tx.minP);
    setText(this.out.two, tx.two);
    setText(this.out.right, tx.right);
    setText(this.out.left, tx.left);
    setText(this.out.leftMin, tx.leftMin);
    setText(this.out.excluded, tx.excluded);
    setText(this.out.excludedCount, tx.excludedCount);
    setText(this.out.keptLegend, 'Placebo states kept (' + (r.n - 1) + ')');
    var showExcl = this.exclBox.checked;
    if (showExcl && r.excluded.length) this.exclLegend.removeAttribute('hidden');
    else this.exclLegend.setAttribute('hidden', '');
    this.draw(r, year, showExcl);

    var state, msg, sub;
    if (c == null) {
      state = 'mild';
      msg = 'Without a cutoff, all ' + NS + ' states stay in the test.';
      sub = 'California ranks ' + tx.rank + ', so p = ' + tx.p + '. Placebo states with a poor fit before 1989 stay in the comparison as well.';
    } else {
      state = r.rank === 1 ? 'ok' : 'mild';
      msg = 'The cutoff keeps ' + tx.kept + ' states, so the smallest attainable p-value is ' + tx.minP + '.';
      sub = 'California ranks ' + tx.rank + ', so p = ' + tx.p +
        '. No p-value can fall below one divided by the number of states that remain, so a stricter cutoff raises this floor.';
    }
    setAttr(this.flag, 'data-state', state);
    setText(this.out.flag, msg);
    setText(this.out.flagSub, sub);
    setText(this.pDesc, 'Left-sided p-values from 1989 to 2000 with the current cutoff: ' +
      r.left.map(function (p) { return fmt(p, DP.p); }).join(', ') + '.');
  };

  CutoffLab.prototype.draw = function (r, year, showExcl) {
    var C = this.gaps, U = placeboUnits(), keptSet = {}, k, u;
    r.kept.forEach(function (i) { keptSet[i] = true; });
    var shown = r.kept.map(function (i) { return U[i].gap; });
    var e = extent(shown.concat([[0]])), dom = niceDomain(e[0], e[1], 6), ys = scale(dom, C.y1, C.y0);
    C.yTicks(dom, ys);
    setAttr(C.q('[data-line="zero"]'), 'd', C.hline(ys(0)));
    setAttr(C.q('[data-line="onset"]'), 'd', C.vline(TREAT_YEAR));
    for (u = 0; u < NS; u++) {
      var p = this.unitPaths[u];
      if (!p) continue;
      if (keptSet[u]) {
        setAttr(p, 'class', 'sl-line sl-line-placebo');
        setAttr(p, 'd', C.path(U[u].gap, YEAR0, ys));
        if (p.parentNode !== this.keptG) this.keptG.appendChild(p);
      } else {
        setAttr(p, 'class', 'sl-line sl-line-excl');
        setAttr(p, 'd', showExcl ? C.path(U[u].gap, YEAR0, ys) : '');
        if (p.parentNode !== this.exclG) this.exclG.appendChild(p);
      }
    }
    setAttr(C.q('[data-line="ca"]'), 'd', C.path(U[CA].gap, YEAR0, ys));
    setAttr(C.q('[data-line="year"]'), 'd', C.vline(year));
    var dot = C.q('[data-dot="year"]');
    setAttr(dot, 'cx', r1(C.xs(year)));
    setAttr(dot, 'cy', r1(ys(U[CA].gap[year - YEAR0])));

    var P = this.pc, pd = { lo: 0, hi: 0.25, step: 0.05 }, ps = scale(pd, P.y1, P.y0), line = '';
    P.yTicks(pd, ps);
    setAttr(P.q('[data-line="p05"]'), 'd', P.hline(ps(0.05)));
    setAttr(P.q('[data-line="p10"]'), 'd', P.hline(ps(0.10)));
    setAttr(P.q('[data-line="floor"]'), 'd', P.hline(ps(r.minP)));
    for (k = 0; k < NPOST; k++) {
      var yr = TREAT_YEAR + k, x = r1(P.xs(yr)), yy = r1(ps(Math.min(r.left[k], pd.hi)));
      line += (k ? 'L' : 'M') + x + ' ' + yy;
      setAttr(this.dots[k], 'cx', x);
      setAttr(this.dots[k], 'cy', yy);
      setAttr(this.dots[k], 'class', yr === year ? 'sl-pdot sl-pdot-sel' : 'sl-pdot');
      setAttr(this.dots[k], 'r', yr === year ? '6' : '4');
    }
    setAttr(P.q('[data-line="p"]'), 'd', line);
    setAttr(P.q('[data-line="psel"]'), 'd', P.vline(year));
  };

  CutoffLab.prototype.announcement = function () {
    var L = this.last, tx = L.tx;
    return cutWords(L.r.cutoff) + '. ' + tx.kept + ' states kept. California ranks ' + tx.rank +
      ', p equals ' + tx.p + '. In ' + L.year + ', the left-sided p equals ' + tx.left + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Tab 3: the in-time placebo                                          */
  /* ------------------------------------------------------------------ */

  function IntimeLab(lab, root) {
    var self = this;
    var q = function (s) { return pick(root, s); };
    this.lab = lab;
    this.root = root;
    this.radios = Array.prototype.slice.call(root.querySelectorAll('input[data-fake]'));
    this.paths = new Chart(q('svg[data-plot="intime-paths"]'), YEAR0, LAST_YEAR, 6);
    this.gapc = new Chart(q('svg[data-plot="intime-gap"]'), YEAR0, LAST_YEAR, 6);
    this.paths.xTicks(YEAR_TICKS);
    this.gapc.xTicks(YEAR_TICKS);
    this.out = {};
    ['weights', 'pre', 'preSpan', 'fake', 'fakeSpan', 'fakeMean', 'maxFake', 'postMean', 'att', 'flag', 'flagSub'].forEach(function (key) {
      self.out[key] = q('[data-out="it-' + key + '"]');
    });
    this.flag = q('[data-flag="intime"]');
    this.radios.forEach(function (rd) {
      rd.addEventListener('change', function () { self.lab.schedule(self); self.lab.announceSoon(); });
    });
  }

  IntimeLab.prototype.fakeYear = function () {
    for (var i = 0; i < this.radios.length; i++) if (this.radios[i].checked) return Number(this.radios[i].value);
    return FAKE_DEFAULT;
  };
  IntimeLab.prototype.status = function () {
    return 'The data of this post, fake start in ' + this.fakeYear();
  };

  IntimeLab.prototype.render = function () {
    var r = intime(this.fakeYear()), tx = intimeText(r);
    this.last = { r: r, tx: tx };
    setText(this.out.weights, tx.weights);
    setText(this.out.pre, tx.pre);
    setText(this.out.preSpan, tx.preSpan);
    setText(this.out.fake, tx.fake);
    setText(this.out.fakeSpan, tx.fakeSpan);
    setText(this.out.fakeMean, tx.fakeMean);
    setText(this.out.maxFake, tx.maxFake);
    setText(this.out.postMean, tx.postMean);
    setText(this.out.att, fmt(BASE.att, DP.att));
    this.draw(r);
    var share = fmt(Math.abs(r.fakeGapMean / BASE.att), 2);
    setAttr(this.flag, 'data-state', 'mild');
    setText(this.out.flag, 'The fake gaps average ' + tx.fakeMean + ', or ' + share + ' times the baseline ATT of ' +
      fmt(BASE.att, DP.att) + '.');
    setText(this.out.flagSub, 'A credible design shows fake gaps that are small relative to the real effect. ' +
      'They need not be zero, because a fit that ends at the fake start must predict beyond its fitting period.');
  };

  IntimeLab.prototype.draw = function (r) {
    var P = this.paths, G = this.gapc, F = r.fakeYear, ca = row(CA);
    var e = extent([ca, r.synthetic]), dom = niceDomain(e[0], e[1], 5), ys = scale(dom, P.y1, P.y0);
    P.yTicks(dom, ys);
    P.shade(P.q('[data-shade="fake"]'), F, TREAT_YEAR);
    setAttr(P.q('[data-line="fake"]'), 'd', P.vline(F));
    setAttr(P.q('[data-line="onset"]'), 'd', P.vline(TREAT_YEAR));
    setAttr(P.q('[data-line="ca"]'), 'd', P.path(ca, YEAR0, ys));
    setAttr(P.q('[data-line="synth"]'), 'd', P.path(r.synthetic, YEAR0, ys));

    var eg = extent([r.gap, [0]]), gd = niceDomain(eg[0], eg[1], 4), gs = scale(gd, G.y1, G.y0);
    G.yTicks(gd, gs);
    G.shade(G.q('[data-shade="fake"]'), F, TREAT_YEAR);
    setAttr(G.q('[data-line="zero"]'), 'd', G.hline(gs(0)));
    setAttr(G.q('[data-line="fake"]'), 'd', G.vline(F));
    setAttr(G.q('[data-line="onset"]'), 'd', G.vline(TREAT_YEAR));
    setAttr(G.q('[data-line="gap"]'), 'd', G.path(r.gap, YEAR0, gs));
  };

  IntimeLab.prototype.announcement = function () {
    var r = this.last.r, tx = this.last.tx;
    return 'Fake start in ' + r.fakeYear + '. Pre-treatment RMSE ' + tx.pre + '. Mean fake gap ' + tx.fakeMean +
      '. Mean gap from 1989 to 2000 ' + tx.postMean + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Tab 4: leave-one-out                                                */
  /* ------------------------------------------------------------------ */

  function LooLab(lab, root) {
    var self = this;
    var q = function (s) { return pick(root, s); };
    this.lab = lab;
    this.root = root;
    this.radios = Array.prototype.slice.call(root.querySelectorAll('input[data-drop]'));
    this.allBox = q('input[data-toggle="all"]');
    this.chart = new Chart(q('svg[data-plot="loo-gaps"]'), YEAR0, LAST_YEAR, 6);
    this.chart.xTicks(YEAR_TICKS);
    this.othersG = this.chart.q('[data-lines="others"]');
    this.otherPaths = LOO_ORDER.map(function () {
      var p = svgEl('path', 'sl-line sl-line-other');
      self.othersG.appendChild(p);
      return p;
    });
    this.out = {};
    ['fit', 'att', 'gap2000', 'pre', 'weights', 'attRange', 'gapRange', 'flag', 'flagSub'].forEach(function (key) {
      self.out[key] = q('[data-out="lo-' + key + '"]');
    });
    this.flag = q('[data-flag="loo"]');
    this.radios.forEach(function (rd) {
      rd.addEventListener('change', function () { self.lab.schedule(self); self.lab.announceSoon(); });
    });
    this.allBox.addEventListener('change', function () { self.lab.schedule(self); self.lab.announceSoon(); });
    this.drawStatic();
  }

  LooLab.prototype.dropped = function () {
    for (var i = 0; i < this.radios.length; i++) if (this.radios[i].checked) return this.radios[i].value;
    return 'none';
  };
  LooLab.prototype.status = function () {
    var d = this.dropped();
    return 'The data of this post, ' + (d === 'none' ? 'baseline fit' : 'refit without ' + d);
  };

  // The scale stays fixed across selections, so the eye can compare the refits.
  LooLab.prototype.drawStatic = function () {
    var C = this.chart, band = looBand(), all = band.fits.map(function (f) { return f.gap; });
    all.push(BASE.gap, [0]);
    var e = extent(all), dom = niceDomain(e[0], e[1], 6);
    this.ys = scale(dom, C.y1, C.y0);
    C.yTicks(dom, this.ys);
    setAttr(C.q('[data-line="zero"]'), 'd', C.hline(this.ys(0)));
    setAttr(C.q('[data-line="onset"]'), 'd', C.vline(TREAT_YEAR));
    var top = '', bottom = '', k;
    for (k = 0; k < NPOST; k++) top += (k ? 'L' : 'M') + r1(C.xs(TREAT_YEAR + k)) + ' ' + r1(this.ys(band.hi[k]));
    for (k = NPOST - 1; k >= 0; k--) bottom += 'L' + r1(C.xs(TREAT_YEAR + k)) + ' ' + r1(this.ys(band.lo[k]));
    setAttr(C.q('[data-band="band"]'), 'd', top + bottom + 'Z');
    setAttr(C.q('[data-line="base"]'), 'd', C.path(BASE.gap, YEAR0, this.ys));
  };

  LooLab.prototype.render = function () {
    var d = this.dropped(), r = loo(d), band = looBand(), tx = looText(r, band), C = this.chart, self = this;
    this.last = { r: r, tx: tx };
    var showAll = this.allBox.checked;
    LOO_ORDER.forEach(function (name, k) {
      var on = showAll && name !== d;
      setAttr(self.otherPaths[k], 'd', on ? C.path(band.fits[k].gap, YEAR0, self.ys) : '');
    });
    setAttr(C.q('[data-line="sel"]'), 'd', d === 'none' ? '' : C.path(r.gap, YEAR0, this.ys));
    setText(this.out.fit, tx.fit);
    setText(this.out.att, tx.att);
    setText(this.out.gap2000, tx.gap2000);
    setText(this.out.pre, tx.pre);
    setText(this.out.weights, tx.weights);
    setText(this.out.attRange, tx.attRange);
    setText(this.out.gapRange, tx.gapRange);
    setAttr(this.flag, 'data-state', 'ok');
    setText(this.out.flag, 'Every refit keeps a large negative effect: the ATT ranges from ' + tx.attRange + '.');
    if (d === 'none') {
      setText(this.out.flagSub, 'The shaded band spans the five refits from 1989 to 2000. Pick a donor to see which state takes its place.');
    } else {
      var top = r.positive[0], basePre = fmt(BASE.preRMSPE, DP.rmspe);
      setText(this.out.flagSub, 'Without ' + d + ', the refit gives the largest weight to ' + top[0] + ' (' +
        fmt(top[1], DP.weight) + '), and the pre-treatment RMSE ' + (r.preRMSE >= BASE.preRMSPE ? 'rises' : 'falls') +
        ' from ' + basePre + ' to ' + tx.pre + '.');
    }
  };

  LooLab.prototype.announcement = function () {
    var tx = this.last.tx;
    return (this.last.r.dropped === 'none' ? 'Baseline fit' : 'Refit without ' + this.last.r.dropped) +
      '. ATT ' + tx.att + '. Gap in 2000 ' + tx.gap2000 + '.';
  };

  /* ------------------------------------------------------------------ */
  /* Lab shell: tabs, scheduling, announcements                          */
  /* ------------------------------------------------------------------ */

  function Lab(el) {
    var self = this;
    this.el = el;
    this.status = pick(el, '[data-out="status"]');
    this.live = pick(el, '[data-live="live"]');
    this.tabs = Array.prototype.slice.call(el.querySelectorAll('[role="tab"]'));
    this.panels = {};
    TABS.forEach(function (name) { self.panels[name] = pick(el, '[data-panel="' + name + '"]'); });
    this.dirty = [];
    this.subs = {
      mixer: new MixerLab(this, this.panels.mixer),
      cutoff: new CutoffLab(this, this.panels.cutoff),
      intime: new IntimeLab(this, this.panels.intime),
      loo: new LooLab(this, this.panels.loo)
    };
    this.bindTabs();
    var start = el.getAttribute('data-tab');
    this.select(TABS.indexOf(start) >= 0 ? start : 'mixer', false);
    this.dirty = [];
    TABS.forEach(function (name) { self.subs[name].render(); });
    this.updateStatus();
    el.setAttribute('data-ready', '');
  }

  Lab.prototype.bindTabs = function () {
    var self = this;
    this.tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { self.select(tab.getAttribute('data-tab'), true); });
      tab.addEventListener('keydown', function (ev) {
        var n = self.tabs.length, j = null;
        if (ev.key === 'ArrowRight') j = (idx + 1) % n;
        else if (ev.key === 'ArrowLeft') j = (idx - 1 + n) % n;
        else if (ev.key === 'Home') j = 0;
        else if (ev.key === 'End') j = n - 1;
        if (j === null) return;
        ev.preventDefault();
        self.select(self.tabs[j].getAttribute('data-tab'), true);
        self.tabs[j].focus();
      });
    });
  };

  Lab.prototype.select = function (name, announce) {
    var self = this;
    this.active = name;
    this.tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
    TABS.forEach(function (k) {
      if (k === name) self.panels[k].removeAttribute('hidden');
      else self.panels[k].setAttribute('hidden', '');
    });
    this.el.setAttribute('data-active', name);
    this.updateStatus();
    if (announce) this.announceSoon();
  };

  Lab.prototype.updateStatus = function () {
    if (this.subs && this.subs[this.active]) setText(this.status, this.subs[this.active].status());
  };

  Lab.prototype.schedule = function (sub) {
    var self = this;
    if (!this.subs) return; // still constructing: the first render follows
    if (this.dirty.indexOf(sub) < 0) this.dirty.push(sub);
    if (this.frame) return;
    var raf = W.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    this.frame = raf(function () {
      var list = self.dirty;
      self.frame = 0;
      self.dirty = [];
      list.forEach(function (s) { s.render(); });
      self.updateStatus();
    });
  };

  Lab.prototype.announceSoon = function () {
    var self = this;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(function () {
      if (!self.live) return;
      if (self.frame) { self.announceSoon(); return; }
      self.live.textContent = self.subs[self.active].announcement();
    }, 400);
  };

  function initAll() {
    var els = document.querySelectorAll('.sc-lab[data-sc-lab]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].hasAttribute('data-ready') || els[i]._scLab) continue;
      try {
        els[i]._scLab = new Lab(els[i]);
      } catch (e) {
        if (W.console) W.console.error('sc-lab: could not start', els[i].id, e);
      }
    }
  }

  W.ScLab = {
    __loaded: true,
    YEAR0: YEAR0, T: T, T0: T0, CA: CA, STATES: STATES, FITS: FITS, GAP_OVERRIDES: GAP_OVERRIDES,
    CUT_STOPS: CUT_STOPS, CUT_DEFAULT: CUT_DEFAULT, FAKE_YEARS: FAKE_YEARS, FAKE_DEFAULT: FAKE_DEFAULT,
    LOO_ORDER: LOO_ORDER, PRESET_KEYS: PRESET_KEYS, DP: DP,
    y: y, row: row, dense: dense, synth: synth, gapOf: gapOf, summarize: summarize,
    normalize: normalize, mixer: mixer, mixShares: mixShares, presetWeights: presetWeights,
    positiveWeights: positiveWeights, placeboUnits: placeboUnits, placebo: placebo,
    intime: intime, loo: loo, looBand: looBand, fmt: fmt,
    text: { mixer: mixerText, cutoff: cutoffText, intime: intimeText, loo: looText },
    init: initAll
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();
  }
})();
