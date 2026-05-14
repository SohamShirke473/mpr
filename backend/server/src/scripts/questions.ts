export const questions = [
  {
    "title": "Valid Parentheses",
    "difficulty": "EASY" as const,
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if:\n\nOpen brackets must be closed by the same type of brackets.\nOpen brackets must be closed in the correct order.\nEvery close bracket has a corresponding open bracket of the same type.\n\nConstraints:\n1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    "inputFormat": "First line: string s (without quotes).",
    "outputFormat": "true or false (lowercase).",
    "constraints": "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'.",
    "tags": ["stack", "string"],
    "sampleCases": [
      {
        "input": "()",
        "expectedOutput": "true"
      },
      {
        "input": "()[]{}",
        "expectedOutput": "true"
      }
    ],
    "hiddenCases": [
      {
        "input": "(]",
        "expectedOutput": "false"
      },
      {
        "input": "([)]",
        "expectedOutput": "false"
      },
      {
        "input": "{[]}",
        "expectedOutput": "true"
      },
      {
        "input": "((((((((((())))))))))",
        "expectedOutput": "false"
      },
      {
        "input": "(((((((((())))))))))",
        "expectedOutput": "true"
      },
      {
        "input": "((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((",
        "expectedOutput": "false"
      },
      {
        "input": "((((((((((((((((((((()))))))))))))))))))))",
        "expectedOutput": "true"
      },
      {
        "input": "({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[({[",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "title": "Two Sum",
    "difficulty": "EASY" as const,
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "inputFormat": "First line: space-separated integers (nums). Second line: integer target.",
    "outputFormat": "Two space-separated indices (0-indexed, ascending order).",
    "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, exactly one valid answer exists.",
    "tags": ["array", "hash-table"],
    "sampleCases": [
      {
        "input": "2 7 11 15\n9",
        "expectedOutput": "0 1"
      },
      {
        "input": "3 2 4\n6",
        "expectedOutput": "1 2"
      }
    ],
    "hiddenCases": [
      {
        "input": "0 4 3 0\n0",
        "expectedOutput": "0 3"
      },
      {
        "input": "-1 -2 -3 -4 -5\n-8",
        "expectedOutput": "2 4"
      },
      {
        "input": "5 5 5 5\n10",
        "expectedOutput": "0 1"
      },
      {
        "input": "1000000000 1000000000\n2000000000",
        "expectedOutput": "0 1"
      },
      {
        "input": "-1000000000 1000000000\n0",
        "expectedOutput": "0 1"
      },
      {
        "input": "1 3 5 7 9 11 13 15 17 19 21 23 25 27 29 31 33 35 37 39 41 43 45 47 49 51 53 55 57 59 61 63 65 67 69 71 73 75 77 79 81 83 85 87 89 91 93 95 97 99\n100",
        "expectedOutput": "24 25"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277 278 279 280 281 282 283 284 285 286 287 288 289 290 291 292 293 294 295 296 297 298 299 300 301 302 303 304 305 306 307 308 309 310 311 312 313 314 315 316 317 318 319 320 321 322 323 324 325 326 327 328 329 330 331 332 333 334 335 336 337 338 339 340 341 342 343 344 345 346 347 348 349 350 351 352 353 354 355 356 357 358 359 360 361 362 363 364 365 366 367 368 369 370 371 372 373 374 375 376 377 378 379 380 381 382 383 384 385 386 387 388 389 390 391 392 393 394 395 396 397 398 399 400 401 402 403 404 405 406 407 408 409 410 411 412 413 414 415 416 417 418 419 420 421 422 423 424 425 426 427 428 429 430 431 432 433 434 435 436 437 438 439 440 441 442 443 444 445 446 447 448 449 450 451 452 453 454 455 456 457 458 459 460 461 462 463 464 465 466 467 468 469 470 471 472 473 474 475 476 477 478 479 480 481 482 483 484 485 486 487 488 489 490 491 492 493 494 495 496 497 498 499 500 501 502 503 504 505 506 507 508 509 510 511 512 513 514 515 516 517 518 519 520 521 522 523 524 525 526 527 528 529 530 531 532 533 534 535 536 537 538 539 540 541 542 543 544 545 546 547 548 549 550 551 552 553 554 555 556 557 558 559 560 561 562 563 564 565 566 567 568 569 570 571 572 573 574 575 576 577 578 579 580 581 582 583 584 585 586 587 588 589 590 591 592 593 594 595 596 597 598 599 600 601 602 603 604 605 606 607 608 609 610 611 612 613 614 615 616 617 618 619 620 621 622 623 624 625 626 627 628 629 630 631 632 633 634 635 636 637 638 639 640 641 642 643 644 645 646 647 648 649 650 651 652 653 654 655 656 657 658 659 660 661 662 663 664 665 666 667 668 669 670 671 672 673 674 675 676 677 678 679 680 681 682 683 684 685 686 687 688 689 690 691 692 693 694 695 696 697 698 699 700 701 702 703 704 705 706 707 708 709 710 711 712 713 714 715 716 717 718 719 720 721 722 723 724 725 726 727 728 729 730 731 732 733 734 735 736 737 738 739 740 741 742 743 744 745 746 747 748 749 750 751 752 753 754 755 756 757 758 759 760 761 762 763 764 765 766 767 768 769 770 771 772 773 774 775 776 777 778 779 780 781 782 783 784 785 786 787 788 789 790 791 792 793 794 795 796 797 798 799 800 801 802 803 804 805 806 807 808 809 810 811 812 813 814 815 816 817 818 819 820 821 822 823 824 825 826 827 828 829 830 831 832 833 834 835 836 837 838 839 840 841 842 843 844 845 846 847 848 849 850 851 852 853 854 855 856 857 858 859 860 861 862 863 864 865 866 867 868 869 870 871 872 873 874 875 876 877 878 879 880 881 882 883 884 885 886 887 888 889 890 891 892 893 894 895 896 897 898 899 900 901 902 903 904 905 906 907 908 909 910 911 912 913 914 915 916 917 918 919 920 921 922 923 924 925 926 927 928 929 930 931 932 933 934 935 936 937 938 939 940 941 942 943 944 945 946 947 948 949 950 951 952 953 954 955 956 957 958 959 960 961 962 963 964 965 966 967 968 969 970 971 972 973 974 975 976 977 978 979 980 981 982 983 984 985 986 987 988 989 990 991 992 993 994 995 996 997 998 999 1000\n1999",
        "expectedOutput": "998 999"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277 278 279 280 281 282 283 284 285 286 287 288 289 290 291 292 293 294 295 296 297 298 299 300 301 302 303 304 305 306 307 308 309 310 311 312 313 314 315 316 317 318 319 320 321 322 323 324 325 326 327 328 329 330 331 332 333 334 335 336 337 338 339 340 341 342 343 344 345 346 347 348 349 350 351 352 353 354 355 356 357 358 359 360 361 362 363 364 365 366 367 368 369 370 371 372 373 374 375 376 377 378 379 380 381 382 383 384 385 386 387 388 389 390 391 392 393 394 395 396 397 398 399 400 401 402 403 404 405 406 407 408 409 410 411 412 413 414 415 416 417 418 419 420 421 422 423 424 425 426 427 428 429 430 431 432 433 434 435 436 437 438 439 440 441 442 443 444 445 446 447 448 449 450 451 452 453 454 455 456 457 458 459 460 461 462 463 464 465 466 467 468 469 470 471 472 473 474 475 476 477 478 479 480 481 482 483 484 485 486 487 488 489 490 491 492 493 494 495 496 497 498 499 500 501 502 503 504 505 506 507 508 509 510 511 512 513 514 515 516 517 518 519 520 521 522 523 524 525 526 527 528 529 530 531 532 533 534 535 536 537 538 539 540 541 542 543 544 545 546 547 548 549 550 551 552 553 554 555 556 557 558 559 560 561 562 563 564 565 566 567 568 569 570 571 572 573 574 575 576 577 578 579 580 581 582 583 584 585 586 587 588 589 590 591 592 593 594 595 596 597 598 599 600 601 602 603 604 605 606 607 608 609 610 611 612 613 614 615 616 617 618 619 620 621 622 623 624 625 626 627 628 629 630 631 632 633 634 635 636 637 638 639 640 641 642 643 644 645 646 647 648 649 650 651 652 653 654 655 656 657 658 659 660 661 662 663 664 665 666 667 668 669 670 671 672 673 674 675 676 677 678 679 680 681 682 683 684 685 686 687 688 689 690 691 692 693 694 695 696 697 698 699 700 701 702 703 704 705 706 707 708 709 710 711 712 713 714 715 716 717 718 719 720 721 722 723 724 725 726 727 728 729 730 731 732 733 734 735 736 737 738 739 740 741 742 743 744 745 746 747 748 749 750 751 752 753 754 755 756 757 758 759 760 761 762 763 764 765 766 767 768 769 770 771 772 773 774 775 776 777 778 779 780 781 782 783 784 785 786 787 788 789 790 791 792 793 794 795 796 797 798 799 800 801 802 803 804 805 806 807 808 809 810 811 812 813 814 815 816 817 818 819 820 821 822 823 824 825 826 827 828 829 830 831 832 833 834 835 836 837 838 839 840 841 842 843 844 845 846 847 848 849 850 851 852 853 854 855 856 857 858 859 860 861 862 863 864 865 866 867 868 869 870 871 872 873 874 875 876 877 878 879 880 881 882 883 884 885 886 887 888 889 890 891 892 893 894 895 896 897 898 899 900 901 902 903 904 905 906 907 908 909 910 911 912 913 914 915 916 917 918 919 920 921 922 923 924 925 926 927 928 929 930 931 932 933 934 935 936 937 938 939 940 941 942 943 944 945 946 947 948 949 950 951 952 953 954 955 956 957 958 959 960 961 962 963 964 965 966 967 968 969 970 971 972 973 974 975 976 977 978 979 980 981 982 983 984 985 986 987 988 989 990 991 992 993 994 995 996 997 998 999 1000 1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011 1012 1013 1014 1015 1016 1017 1018 1019 1020 1021 1022 1023 1024 1025 1026 1027 1028 1029 1030 1031 1032 1033 1034 1035 1036 1037 1038 1039 1040 1041 1042 1043 1044 1045 1046 1047 1048 1049 1050 1051 1052 1053 1054 1055 1056 1057 1058 1059 1060 1061 1062 1063 1064 1065 1066 1067 1068 1069 1070 1071 1072 1073 1074 1075 1076 1077 1078 1079 1080 1081 1082 1083 1084 1085 1086 1087 1088 1089 1090 1091 1092 1093 1094 1095 1096 1097 1098 1099 1100 1101 1102 1103 1104 1105 1106 1107 1108 1109 1110 1111 1112 1113 1114 1115 1116 1117 1118 1119 1120 1121 1122 1123 1124 1125 1126 1127 1128 1129 1130 1131 1132 1133 1134 1135 1136 1137 1138 1139 1140 1141 1142 1143 1144 1145 1146 1147 1148 1149 1150 1151 1152 1153 1154 1155 1156 1157 1158 1159 1160 1161 1162 1163 1164 1165 1166 1167 1168 1169 1170 1171 1172 1173 1174 1175 1176 1177 1178 1179 1180 1181 1182 1183 1184 1185 1186 1187 1188 1189 1190 1191 1192 1193 1194 1195 1196 1197 1198 1199 1200 1201 1202 1203 1204 1205 1206 1207 1208 1209 1210 1211 1212 1213 1214 1215 1216 1217 1218 1219 1220 1221 1222 1223 1224 1225 1226 1227 1228 1229 1230 1231 1232 1233 1234 1235 1236 1237 1238 1239 1240 1241 1242 1243 1244 1245 1246 1247 1248 1249 1250 1251 1252 1253 1254 1255 1256 1257 1258 1259 1260 1261 1262 1263 1264 1265 1266 1267 1268 1269 1270 1271 1272 1273 1274 1275 1276 1277 1278 1279 1280 1281 1282 1283 1284 1285 1286 1287 1288 1289 1290 1291 1292 1293 1294 1295 1296 1297 1298 1299 1300 1301 1302 1303 1304 1305 1306 1307 1308 1309 1310 1311 1312 1313 1314 1315 1316 1317 1318 1319 1320 1321 1322 1323 1324 1325 1326 1327 1328 1329 1330 1331 1332 1333 1334 1335 1336 1337 1338 1339 1340 1341 1342 1343 1344 1345 1346 1347 1348 1349 1350 1351 1352 1353 1354 1355 1356 1357 1358 1359 1360 1361 1362 1363 1364 1365 1366 1367 1368 1369 1370 1371 1372 1373 1374 1375 1376 1377 1378 1379 1380 1381 1382 1383 1384 1385 1386 1387 1388 1389 1390 1391 1392 1393 1394 1395 1396 1397 1398 1399 1400 1401 1402 1403 1404 1405 1406 1407 1408 1409 1410 1411 1412 1413 1414 1415 1416 1417 1418 1419 1420 1421 1422 1423 1424 1425 1426 1427 1428 1429 1430 1431 1432 1433 1434 1435 1436 1437 1438 1439 1440 1441 1442 1443 1444 1445 1446 1447 1448 1449 1450 1451 1452 1453 1454 1455 1456 1457 1458 1459 1460 1461 1462 1463 1464 1465 1466 1467 1468 1469 1470 1471 1472 1473 1474 1475 1476 1477 1478 1479 1480 1481 1482 1483 1484 1485 1486 1487 1488 1489 1490 1491 1492 1493 1494 1495 1496 1497 1498 1499 1500\n2999",
        "expectedOutput": "1498 1499"
      }
    ]
  },
  {
    "title": "Merge Two Sorted Lists",
    "difficulty": "EASY" as const,
    "description": "You are given the heads of two sorted linked lists list1 and list2.\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\nReturn the head of the merged linked list.",
    "inputFormat": "First line: space-separated integers representing list1 (sorted non-decreasing). Second line: space-separated integers representing list2 (sorted non-decreasing).",
    "outputFormat": "Space-separated integers of the merged sorted list.",
    "constraints": "0 <= len(list1), len(list2) <= 50, -100 <= value <= 100, lists are sorted non-decreasing.",
    "tags": ["recursion", "linked-list"],
    "sampleCases": [
      {
        "input": "1 1 1\n1 1 1",
        "expectedOutput": "1 1 1 1 1 1"
      },
      {
        "input": "10 20 30\n5 15 25 35",
        "expectedOutput": "5 10 15 20 25 30 35"
      }
    ],
    "hiddenCases": [
      {
        "input": "\n\n",
        "expectedOutput": ""
      },
      {
        "input": "\n0",
        "expectedOutput": "0"
      },
      {
        "input": "-1 0 2\n-2 -1 0",
        "expectedOutput": "-2 -1 -1 0 0 2"
      },
      {
        "input": "5\n1 2 3",
        "expectedOutput": "1 2 3 5"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50\n51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100",
        "expectedOutput": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100"
      },
      {
        "input": "1 3 5 7 9 11 13 15 17 19 21 23 25 27 29 31 33 35 37 39 41 43 45 47 49\n2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40 42 44 46 48 50",
        "expectedOutput": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50"
      },
      {
        "input": "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0",
        "expectedOutput": "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
      },
      {
        "input": "-50 -49 -48 -47 -46 -45 -44 -43 -42 -41 -40 -39 -38 -37 -36 -35 -34 -33 -32 -31 -30 -29 -28 -27 -26 -25 -24 -23 -22 -21 -20 -19 -18 -17 -16 -15 -14 -13 -12 -11 -10 -9 -8 -7 -6 -5 -4 -3 -2 -1\n0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49",
        "expectedOutput": "-50 -49 -48 -47 -46 -45 -44 -43 -42 -41 -40 -39 -38 -37 -36 -35 -34 -33 -32 -31 -30 -29 -28 -27 -26 -25 -24 -23 -22 -21 -20 -19 -18 -17 -16 -15 -14 -13 -12 -11 -10 -9 -8 -7 -6 -5 -4 -3 -2 -1 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49"
      }
    ]
  },
  {
    "title": "Reverse Linked List",
    "difficulty": "EASY" as const,
    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    "inputFormat": "First line: space-separated integers representing the linked list (head to tail).",
    "outputFormat": "Space-separated integers of the reversed list (empty string for empty list).",
    "constraints": "0 <= number of nodes <= 5000, -5000 <= Node.val <= 5000.",
    "tags": ["recursion", "linked-list"],
    "sampleCases": [
      {
        "input": "5000 -5000 0 1000 -1000",
        "expectedOutput": "-1000 1000 0 -5000 5000"
      },
      {
        "input": "1 2 3 4 5",
        "expectedOutput": "5 4 3 2 1"
      }
    ],
    "hiddenCases": [
      {
        "input": "",
        "expectedOutput": ""
      },
      {
        "input": "1",
        "expectedOutput": "1"
      },
      {
        "input": "-1 -2 -3 -4 -5",
        "expectedOutput": "-5 -4 -3 -2 -1"
      },
      {
        "input": "1 1 1 1 1",
        "expectedOutput": "1 1 1 1 1"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20",
        "expectedOutput": "20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1"
      },
      {
        "input": "100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1500 1600 1700 1800 1900 2000",
        "expectedOutput": "2000 1900 1800 1700 1600 1500 1400 1300 1200 1100 1000 900 800 700 600 500 400 300 200 100"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50",
        "expectedOutput": "50 49 48 47 46 45 44 43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1"
      },
      {
        "input": "1000 2000 3000 4000 5000 6000 7000 8000 9000 10000 11000 12000 13000 14000 15000 16000 17000 18000 19000 20000 21000 22000 23000 24000 25000 26000 27000 28000 29000 30000",
        "expectedOutput": "30000 29000 28000 27000 26000 25000 24000 23000 22000 21000 20000 19000 18000 17000 16000 15000 14000 13000 12000 11000 10000 9000 8000 7000 6000 5000 4000 3000 2000 1000"
      }
    ]
  },
  {
    "title": "Linked List Cycle",
    "difficulty": "EASY" as const,
    "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle, otherwise false.",
    "inputFormat": "First line: space-separated integers representing the linked list values. Second line: integer pos (index where tail connects, -1 for no cycle).",
    "outputFormat": "true or false (lowercase).",
    "constraints": "0 <= number of nodes <= 10^4, -10^5 <= Node.val <= 10^5, pos is -1 or a valid index.",
    "tags": ["hash-table", "linked-list", "two-pointers"],
    "sampleCases": [
      {
        "input": "3 2 0 -4\n1",
        "expectedOutput": "true"
      },
      {
        "input": "1 2\n0",
        "expectedOutput": "true"
      }
    ],
    "hiddenCases": [
      {
        "input": "1\n-1",
        "expectedOutput": "false"
      },
      {
        "input": "1 2 3 4 5\n-1",
        "expectedOutput": "false"
      },
      {
        "input": "1 2 3 4 5\n2",
        "expectedOutput": "true"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10\n0",
        "expectedOutput": "true"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10\n9",
        "expectedOutput": "true"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10\n-1",
        "expectedOutput": "false"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40\n0",
        "expectedOutput": "true"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40\n-1",
        "expectedOutput": "false"
      }
    ]
  }, {
    "title": "Valid Anagram",
    "difficulty": "EASY" as const,
    "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    "inputFormat": "First line: string s. Second line: string t.",
    "outputFormat": "true or false (lowercase).",
    "constraints": "1 <= s.length, t.length <= 5 * 10^4, s and t consist of lowercase English letters.",
    "tags": ["hash-table", "string", "sorting"],
    "sampleCases": [
      {
        "input": "abcdefghijklmnopqrstuvwxyz\nzyxwvutsrqponmlkjihgfedcba",
        "expectedOutput": "true"
      },
      {
        "input": "abcde\nedcba",
        "expectedOutput": "true"
      }
    ],
    "hiddenCases": [
      {
        "input": "abc\nabcd",
        "expectedOutput": "false"
      },
      {
        "input": "a\nb",
        "expectedOutput": "false"
      },
      {
        "input": "ab\nba",
        "expectedOutput": "true"
      },
      {
        "input": "aacc\nccac",
        "expectedOutput": "false"
      },
      {
        "input": "listen\nsilent",
        "expectedOutput": "true"
      },
      {
        "input": "hello\nbello",
        "expectedOutput": "false"
      },
      {
        "input": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "expectedOutput": "true"
      },
      {
        "input": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz\nzyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba",
        "expectedOutput": "true"
      }
    ]
  }, {
    "title": "Valid Palindrome",
    "difficulty": "EASY" as const,
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
    "inputFormat": "First line: string s (may contain spaces, punctuation).",
    "outputFormat": "true or false (lowercase).",
    "constraints": "1 <= s.length <= 2 * 10^5, s consists of printable ASCII characters.",
    "tags": ["two-pointers", "string"],
    "sampleCases": [
      {
        "input": "race a car",
        "expectedOutput": "false"
      },
      {
        "input": " ",
        "expectedOutput": "true"
      }
    ],
    "hiddenCases": [
      {
        "input": "Able was I ere I saw Elba",
        "expectedOutput": "true"
      },
      {
        "input": "0P",
        "expectedOutput": "false"
      },
      {
        "input": "Was it a car or a cat I saw?",
        "expectedOutput": "true"
      },
      {
        "input": "No 'x' in Nixon",
        "expectedOutput": "true"
      },
      {
        "input": "12345678987654321",
        "expectedOutput": "true"
      },
      {
        "input": "abcdefghijklmnopqrstuvwxyzyxwvutsrqponmlkjihgfedcba",
        "expectedOutput": "true"
      },
      {
        "input": "ababababababababababababababababababababababababababababababababababababababababababababababababab",
        "expectedOutput": "false"
      },
      {
        "input": "A man, a plan, a canal: Panama",
        "expectedOutput": "true"
      }
    ]
  }, {
    "title": "Best Time To Buy And Sell Stock",
    "difficulty": "EASY" as const,
    "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a different day in the future to sell. Return the maximum profit. If no profit is possible, return 0.",
    "inputFormat": "First line: space-separated integers (prices).",
    "outputFormat": "Integer (maximum profit).",
    "constraints": "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4.",
    "tags": ["array", "dynamic-programming"],
    "sampleCases": [
      {
        "input": "10 9 8 2",
        "expectedOutput": "0"
      },
      {
        "input": "1",
        "expectedOutput": "0"
      }
    ],
    "hiddenCases": [
      {
        "input": "2 1 2 1 0 1 2",
        "expectedOutput": "2"
      },
      {
        "input": "2 1",
        "expectedOutput": "0"
      },
      {
        "input": "7 6 4 3 1",
        "expectedOutput": "0"
      },
      {
        "input": "3 3 5 0 0 3 1 4",
        "expectedOutput": "4"
      },
      {
        "input": "7 1 5 3 6 4",
        "expectedOutput": "5"
      },
      {
        "input": "1 2 3 4 5",
        "expectedOutput": "4"
      },
      {
        "input": "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100",
        "expectedOutput": "99"
      },
      {
        "input": "100 90 80 70 60 50 40 30 20 10 9 8 7 6 5 4 3 2 1 0",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "title": "Maximum Depth Of Binary Tree",
    "difficulty": "EASY" as const,
    "description": "Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    "inputFormat": "One line: space-separated level-order values, with null for missing nodes.",
    "outputFormat": "Integer representing maximum depth of the tree.",
    "constraints": "0 <= number of nodes <= 10^5, -100 <= Node.val <= 100",
    "tags": ["tree", "dfs", "bfs", "binary-tree"],
    "sampleCases": [
      {
        "input": "1 2 3 4 5 6 7",
        "expectedOutput": "3"
      },
      {
        "input": "1 2 2 3 3 null null 4 4",
        "expectedOutput": "4"
      }
    ],
    "hiddenCases": [
      {
        "input": "1 null 2 null 3 null 4 null 5",
        "expectedOutput": "5"
      },
      {
        "input": "1",
        "expectedOutput": "1"
      },
      {
        "input": "",
        "expectedOutput": "0"
      },
      {
        "input": "3 9 20 null null 15 7",
        "expectedOutput": "3"
      },
      {
        "input": "1 2 null 3 null 4 null",
        "expectedOutput": "4"
      },
      {
        "input": "1 null 2",
        "expectedOutput": "2"
      },
      {
        "input": "5 4 8 11 null 13 4 7 2 null null null 1",
        "expectedOutput": "4"
      },
      {
        "input": "0",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "title": "Climbing Stairs",
    "difficulty": "EASY" as const,
    "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach the top.",
    "inputFormat": "One line: integer n.",
    "outputFormat": "Single integer representing number of distinct ways.",
    "constraints": "1 <= n <= 45",
    "tags": ["math", "dp"],
    "sampleCases": [
      {
        "input": "3",
        "expectedOutput": "3"
      },
      {
        "input": "5",
        "expectedOutput": "8"
      }
    ],
    "hiddenCases": [
      {
        "input": "1",
        "expectedOutput": "1"
      },
      {
        "input": "2",
        "expectedOutput": "2"
      },
      {
        "input": "4",
        "expectedOutput": "5"
      },
      {
        "input": "10",
        "expectedOutput": "89"
      },
      {
        "input": "15",
        "expectedOutput": "987"
      },
      {
        "input": "20",
        "expectedOutput": "10946"
      },
      {
        "input": "30",
        "expectedOutput": "1346269"
      },
      {
        "input": "45",
        "expectedOutput": "1836311903"
      }
    ]
  },
  {
    "title": "3Sum",
    "difficulty": "MEDIUM" as const,
    "description": "Given an integer array nums, return all the unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    "inputFormat": "First line: space-separated integers representing array nums.",
    "outputFormat": "List of unique triplets (each sorted internally) whose sum is 0.",
    "constraints": "3 <= nums.length <= 3000, -10^5 <= nums[i] <= 10^5",
    "tags": ["array", "two-pointers", "sorting"],
    "sampleCases": [
      {
        "input": "-1 0 1",
        "expectedOutput": "-1 0 1"
      },
      {
        "input": "-1 0 1 2 -1 -4",
        "expectedOutput": "-1 -1 2\n-1 0 1"
      }
    ],
    "hiddenCases": [
      {
        "input": "0 0 0",
        "expectedOutput": "0 0 0"
      },
      {
        "input": "1 2 -2 -1",
        "expectedOutput": ""
      },
      {
        "input": "0 0 0 0 0",
        "expectedOutput": "0 0 0"
      },
      {
        "input": "-2 0 1 1 2",
        "expectedOutput": "-2 0 2\n-2 1 1"
      },
      {
        "input": "-100000 0 100000",
        "expectedOutput": "-100000 0 100000"
      },
      {
        "input": "1 -1 -1 0",
        "expectedOutput": "-1 0 1"
      },
      {
        "input": "-3 -2 -1 0 1 2 3",
        "expectedOutput": "-3 0 3\n-3 1 2\n-2 -1 3\n-2 0 2\n-1 0 1"
      },
      {
        "input": "-1 -1 0 0 1 1",
        "expectedOutput": "-1 0 1"
      }
    ]
  },
  {
    "title": "Container With Most Water",
    "difficulty": "MEDIUM" as const,
    "description": "Given an integer array height, find two lines that together with the x-axis form a container that holds the maximum water. Return the maximum area.",
    "inputFormat": "First line: space-separated integers representing height array.",
    "outputFormat": "Single integer representing maximum water that can be contained.",
    "constraints": "2 <= height.length <= 10^5, 0 <= height[i] <= 10^4",
    "tags": ["array", "two-pointers", "greedy"],
    "sampleCases": [
      {
        "input": "1 1",
        "expectedOutput": "1"
      },
      {
        "input": "4 3 2 1 4",
        "expectedOutput": "16"
      }
    ],
    "hiddenCases": [
      {
        "input": "3 8 6 2 5 4 8 7 9",
        "expectedOutput": "56"
      },
      {
        "input": "2 5 7 3 9 4",
        "expectedOutput": "15"
      },
      {
        "input": "9 7 5 3 1",
        "expectedOutput": "9"
      },
      {
        "input": "2 4 1",
        "expectedOutput": "2"
      },
      {
        "input": "0 0 0 0 0",
        "expectedOutput": "0"
      },
      {
        "input": "9876 123 9876",
        "expectedOutput": "19752"
      },
      {
        "input": "6 1 4 6 3 2 5 4",
        "expectedOutput": "24"
      },
      {
        "input": "5 9 3 7 12 6 8 4",
        "expectedOutput": "35"
      }
    ]
  },
  {
    "title": "Maximum Subarray",
    "difficulty": "MEDIUM" as const,
    "description": "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
    "inputFormat": "First line: space-separated integers representing array nums.",
    "outputFormat": "Single integer representing the maximum subarray sum.",
    "constraints": "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
    "tags": ["array", "dynamic-programming", "divide-and-conquer"],
    "sampleCases": [
      {
        "input": "1 2 3 4",
        "expectedOutput": "10"
      },
      {
        "input": "-2 1 -3 4 -1 2 1",
        "expectedOutput": "6"
      }
    ],
    "hiddenCases": [
      {
        "input": "-5 -2 -3 -1 -4",
        "expectedOutput": "-1"
      },
      {
        "input": "0 0 0 0 0",
        "expectedOutput": "0"
      },
      {
        "input": "5",
        "expectedOutput": "5"
      },
      {
        "input": "-2 0 -1",
        "expectedOutput": "0"
      },
      {
        "input": "10000 -5000 2000 -1000 3000 -2000 4000",
        "expectedOutput": "11000"
      },
      {
        "input": "3 -1 2 -1 4 -5 6",
        "expectedOutput": "8"
      },
      {
        "input": "-1 2 3 -2 5 -7 6 2",
        "expectedOutput": "8"
      },
      {
        "input": "1 -2 3 5 -3 2",
        "expectedOutput": "8"
      }
    ]
  },
  {
    "title": "Merge Intervals",
    "difficulty": "MEDIUM" as const,
    "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of non-overlapping intervals that cover all intervals in the input.",
    "inputFormat": "First line: space-separated pairs in format (start,end).",
    "outputFormat": "List of merged non-overlapping intervals sorted by start time.",
    "constraints": "1 <= intervals.length <= 10^4, 0 <= starti <= endi <= 10^4",
    "tags": ["array", "sorting"],
    "sampleCases": [
      {
        "input": "1 3\n2 6\n8 10\n15 18",
        "expectedOutput": "1 6\n8 10\n15 18"
      },
      {
        "input": "1 4\n4 5",
        "expectedOutput": "1 5"
      }
    ],
    "hiddenCases": [
      {
        "input": "1 2\n3 4\n5 6",
        "expectedOutput": "1 2\n3 4\n5 6"
      },
      {
        "input": "1 10\n2 3\n4 8",
        "expectedOutput": "1 10"
      },
      {
        "input": "5 7\n1 3\n2 6",
        "expectedOutput": "1 7"
      },
      {
        "input": "1 1\n2 2\n3 3",
        "expectedOutput": "1 1\n2 2\n3 3"
      },
      {
        "input": "0 5\n5 10\n10 15",
        "expectedOutput": "0 15"
      },
      {
        "input": "100 200\n150 250\n300 400",
        "expectedOutput": "100 250\n300 400"
      },
      {
        "input": "6 8\n1 9\n2 4\n4 7",
        "expectedOutput": "1 9"
      },
      {
        "input": "3 5\n7 9\n6 8\n1 2",
        "expectedOutput": "1 2\n3 5\n6 9"
      }
    ]
  },
  {
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "MEDIUM" as const,
    "description": "Given a string s, find the length of the longest substring without repeating characters.",
    "inputFormat": "First line: string s.",
    "outputFormat": "Single integer representing length of the longest substring without repeating characters.",
    "constraints": "0 <= s.length <= 5 * 10^4, s consists of English letters, digits, symbols and spaces",
    "tags": ["hash-table", "string", "sliding-window"],
    "sampleCases": [
      {
        "input": "abcabcbb",
        "expectedOutput": "3"
      },
      {
        "input": "bbbbb",
        "expectedOutput": "1"
      }
    ],
    "hiddenCases": [
      {
        "input": "pwwkew",
        "expectedOutput": "3"
      },
      {
        "input": "",
        "expectedOutput": "0"
      },
      {
        "input": "a",
        "expectedOutput": "1"
      },
      {
        "input": "abba",
        "expectedOutput": "2"
      },
      {
        "input": "ababababababababab",
        "expectedOutput": "2"
      },
      {
        "input": "abcdefghijklmnopqrstuvwxyz",
        "expectedOutput": "26"
      },
      {
        "input": "a1b2c3d4!@#a1b2",
        "expectedOutput": "10"
      },
      {
        "input": "aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz1234567890!@#$%^&*()_+",
        "expectedOutput": "23"
      }
    ]
  },
  {
    "title": "Search In Rotated Sorted Array",
    "difficulty": "MEDIUM" as const,
    "description": "Given a sorted array that is rotated at an unknown pivot, return the index of the target element if found, else return -1. The algorithm must run in O(log n) time.",
    "inputFormat": "First line: space-separated integers (nums). Second line: integer target.",
    "outputFormat": "Single integer representing index of target, or -1 if not found.",
    "constraints": "1 <= nums.length <= 5000, -10^4 <= nums[i] <= 10^4, all elements are unique, nums is rotated sorted array",
    "tags": ["array", "binary-search"],
    "sampleCases": [
      {
        "input": "1 3\n3",
        "expectedOutput": "1"
      },
      {
        "input": "1 2 3 4 5 6 7\n6",
        "expectedOutput": "5"
      }
    ],
    "hiddenCases": [
      {
        "input": "4 5 6 7 0 1 2\n0",
        "expectedOutput": "4"
      },
      {
        "input": "4 5 6 7 0 1 2\n3",
        "expectedOutput": "-1"
      },
      {
        "input": "1\n0",
        "expectedOutput": "-1"
      },
      {
        "input": "6 7 8 1 2 3 4 5\n6",
        "expectedOutput": "0"
      },
      {
        "input": "999 1000 1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011 1012 1013 1014 1015 1016 1017 1018 1019 1020 1021 1022 1023 1024 1025 1026 1027 1028 1029 1030 1031 1032 1033 1034 1035 1036 1037 1038 1039 1040 1041 1042 1043 1044 1045 1046 1047 1048 1049 1050 1051 1052 1053 1054 1055 1056 1057 1058 1059 1060 1061 1062 1063 1064 1065 1066 1067 1068 1069 1070 1071 1072 1073 1074 1075 1076 1077 1078 1079 1080 1081 1082 1083 1084 1085 1086 1087 1088 1089 1090 1091 1092 1093 1094 1095 1096 1097 1098 1099 0 1 2 3 4 5 6 7 8\n1095",
        "expectedOutput": "96"
      },
      {
        "input": "2 3 4 5 6 7 8 9 1\n1",
        "expectedOutput": "8"
      },
      {
        "input": "100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 0 1 2 3 4 5 6 7 8 9\n145",
        "expectedOutput": "45"
      },
      {
        "input": "100 200 300 400 10 20 30\n25",
        "expectedOutput": "-1"
      }
    ]
  },
  {
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "MEDIUM",
    "description": "Given the root of a binary tree in level-order array form, return its level order traversal (level by level from left to right).",
    "inputFormat": "First line contains integer n (number of elements). Second line contains n space-separated values representing the tree in level-order. Use 'null' for missing nodes.",
    "outputFormat": "First line contains integer k (number of levels). Next k lines contain space-separated node values for each level.",
    "constraints": "0 <= n <= 2000, -1000 <= Node.val <= 1000",
    "tags": ["tree", "bfs", "binary-tree"],
    "sampleCases": [
      {
        "input": "1\n1",
        "expectedOutput": "1\n1"
      },
      {
        "input": "7\n3 9 20 null null 15 7",
        "expectedOutput": "3\n3\n9 20\n15 7"
      }
    ],
    "hiddenCases": [
      {
        "input": "0",
        "expectedOutput": "0"
      },
      {
        "input": "7\n1 2 3 4 5 6 7",
        "expectedOutput": "3\n1\n2 3\n4 5 6 7"
      },
      {
        "input": "7\n1 null 2 null 3 null 4",
        "expectedOutput": "4\n1\n2\n3\n4"
      },
      {
        "input": "7\n1 2 null 3 null 4 null",
        "expectedOutput": "4\n1\n2\n3\n4"
      },
      {
        "input": "7\n0 -1 -2 -3 -4 -5 -6",
        "expectedOutput": "3\n0\n-1 -2\n-3 -4 -5 -6"
      },
      {
        "input": "39\n1 2 3 null 4 null 5 null 6 null 7 null 8 null 9 null 10 null 11 null 12 null 13 null 14 null 15 null 16 null 17 null 18 null 19 null 20",
        "expectedOutput": "11\n1\n2 3\n4 5\n6 7\n8 9\n10 11\n12 13\n14 15\n16 17\n18 19\n20"
      },
      {
        "input": "7\n10 5 15 null null 6 20",
        "expectedOutput": "3\n10\n5 15\n6 20"
      },
      {
        "input": "22\n3 9 20 15 7 18 19 21 null null null null 22 23 24 25 26 null 27 28 29 30",
        "expectedOutput": "5\n3\n9 20\n15 7 18 19\n21 22 23 24\n25 26 27 28 29 30"
      }
    ]
  },
  {
    "title": "Validate Binary Search Tree",
    "difficulty": "MEDIUM" as const,
    "description": "Given the root of a binary tree, determine if it is a valid Binary Search Tree (BST). A BST is valid if for every node, all values in the left subtree are less and all values in the right subtree are greater, and both subtrees are also BSTs.",
    "inputFormat": "Single line: space-separated level-order traversal of tree (use -1 for null nodes).",
    "outputFormat": "Boolean value (true/false).",
    "constraints": "1 <= number of nodes <= 10^4, -2^31 <= Node.val <= 2^31 - 1",
    "tags": ["tree", "dfs", "binary-search-tree", "binary-tree"],
    "sampleCases": [
      {
        "input": "2 1 3",
        "expectedOutput": "true"
      },
      {
        "input": "5 1 4 -1 -1 3 6",
        "expectedOutput": "false"
      }
    ],
    "hiddenCases": [
      {
        "input": "1",
        "expectedOutput": "true"
      },
      {
        "input": "2 2 2",
        "expectedOutput": "false"
      },
      {
        "input": "2 -1 1",
        "expectedOutput": "false"
      },
      {
        "input": "1 -1 2",
        "expectedOutput": "true"
      },
      {
        "input": "10 5 15 -1 -1 6 20",
        "expectedOutput": "false"
      },
      {
        "input": "32 26 40 18 28 36 48 13 19 27 31 34 43 49 52 -1 14 -1 -1 24 29 -1 -1 32 -1 35 41 44 46 47 50 -1 -1 51",
        "expectedOutput": "false"
      },
      {
        "input": "3 1 5 0 2 4 6",
        "expectedOutput": "true"
      },
      {
        "input": "2147483647",
        "expectedOutput": "true"
      }
    ]
  },
  {
    "title": "House Robber",
    "difficulty": "MEDIUM" as const,
    "description": "Given an integer array nums where each element represents money in a house, return the maximum amount you can rob without robbing adjacent houses.",
    "inputFormat": "First line: space-separated integers representing nums.",
    "outputFormat": "Single integer representing maximum amount that can be robbed.",
    "constraints": "1 <= nums.length <= 100, 0 <= nums[i] <= 400",
    "tags": ["array", "dynamic-programming"],
    "sampleCases": [
      {
        "input": "1",
        "expectedOutput": "1"
      },
      {
        "input": "1 2 3 1",
        "expectedOutput": "4"
      }
    ],
    "hiddenCases": [
      {
        "input": "2 1 1 2",
        "expectedOutput": "4"
      },
      {
        "input": "5 2 6 3 4 1",
        "expectedOutput": "15"
      },
      {
        "input": "1 2",
        "expectedOutput": "2"
      },
      {
        "input": "0",
        "expectedOutput": "0"
      },
      {
        "input": "300 200 100 50 25 10 5 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1",
        "expectedOutput": "458"
      },
      {
        "input": "5 10 5 10",
        "expectedOutput": "20"
      },
      {
        "input": "1 3 1 3 100",
        "expectedOutput": "103"
      },
      {
        "input": "10 20 30 40 50",
        "expectedOutput": "90"
      }
    ]
  },
  {
    "title": "Number Of Islands",
    "difficulty": "MEDIUM" as const,
    "description": "Given an m x n grid of '1's (land) and '0's (water), return the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.",
    "inputFormat": "First line: m and n. Next m lines: n space-separated characters ('0' or '1').",
    "outputFormat": "Single integer representing number of islands.",
    "constraints": "1 <= m, n <= 300, grid[i][j] is '0' or '1'",
    "tags": ["dfs", "bfs", "union-find", "matrix"],
    "sampleCases": [
      {
        "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
        "expectedOutput": "1"
      },
      {
        "input": "3 3\n0 0 0\n0 0 0\n0 0 0",
        "expectedOutput": "0"
      }
    ],
    "hiddenCases": [
      {
        "input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
        "expectedOutput": "3"
      },
      {
        "input": "3 3\n1 0 1\n0 1 0\n1 0 1",
        "expectedOutput": "5"
      },
      {
        "input": "1 1\n1",
        "expectedOutput": "1"
      },
      {
        "input": "1 1\n0",
        "expectedOutput": "0"
      },
      {
        "input": "2 5\n1 1 1 1 1\n1 1 1 1 1",
        "expectedOutput": "1"
      },
      {
        "input": "10 11\n1 1 1 0 0 0 1 0 0 0 1\n1 0 1 0 1 0 1 0 1 1 0\n0 1 1 0 1 1 0 0 0 1 1\n0 0 0 1 0 1 0 1 0 1 1\n1 1 0 0 1 1 0 0 1 0 1\n0 1 1 0 1 0 1 1 0 1 0\n1 0 1 1 1 1 1 0 1 1 0\n0 1 1 1 0 0 0 1 0 0 0\n1 0 1 1 0 0 0 0 1 1 0\n1 1 0 0 1 1 1 0 0 1 1",
        "expectedOutput": "14"
      },
      {
        "input": "3 5\n1 1 1 1 1\n0 0 0 0 0\n1 1 1 1 1",
        "expectedOutput": "2"
      },
      {
        "input": "4 4\n1 1 0 0\n1 0 0 1\n0 0 1 1\n0 1 0 0",
        "expectedOutput": "3"
      }
    ]
  },
  // {
  //   "title": "Merge K Sorted Lists",
  //   "difficulty": "HARD" as const,
  //   "description": "You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.",
  //   "inputFormat": "First line: k lists represented as arrays (e.g., [[1,4,5],[1,3,4],[2,6]]).",
  //   "outputFormat": "Single sorted list containing all elements.",
  //   "constraints": "0 <= k <= 10^4, 0 <= lists[i].length <= 500, -10^4 <= lists[i][j] <= 10^4, total number of nodes <= 10^4",
  //   "tags": ["linked-list", "divide-and-conquer", "heap", "merge-sort"],
  //   "sampleCases": [
  //     {
  //       "n": 2,
  //       "input": "1 2\n3 4",
  //       "expectedOutput": "1 2 3 4"
  //     },
  //     {
  //       "n": 3,
  //       "input": "5\n1\n3",
  //       "expectedOutput": "1 3 5"
  //     }
  //   ],
  //   "hiddenCases": [
  //     {
  //       "n": 3,
  //       "input": "\n\n",
  //       "expectedOutput": ""
  //     },
  //     {
  //       "n": 3,
  //       "input": "1 4 5\n1 3 4\n2 6",
  //       "expectedOutput": "1 1 2 3 4 4 5 6"
  //     },
  //     {
  //       "n": 2,
  //       "input": "-10 -5 0\n2 3 9",
  //       "expectedOutput": "-10 -5 0 2 3 9"
  //     },
  //     {
  //       "n": 1,
  //       "input": "7 8 9",
  //       "expectedOutput": "7 8 9"
  //     },
  //     {
  //       "n": 3,
  //       "input": "1 1 1\n1 1\n1",
  //       "expectedOutput": "1 1 1 1 1 1"
  //     },
  //     {
  //       "n": 3,
  //       "input": "2 5 8\n1 3 7 9\n0 4 6",
  //       "expectedOutput": "0 1 2 3 4 5 6 7 8 9"

  //     }
  //   ]
  // },
  {
    "title": "Binary Tree Maximum Path Sum",
    "difficulty": "HARD" as const,
    "description": "Given the root of a binary tree, return the maximum path sum of any non-empty path. A path can start and end at any node and must follow parent-child connections.",
    "inputFormat": "Single line: level-order array representation of tree (use null for missing nodes).",
    "outputFormat": "Single integer representing maximum path sum.",
    "constraints": "1 <= number of nodes <= 3 * 10^4, -1000 <= Node.val <= 1000",
    "tags": ["tree", "dfs", "dynamic-programming", "binary-tree"],
    "sampleCases": [
      {
        "input": "1 2 3",
        "expectedOutput": "6"
      },
      {
        "input": "2 -1",
        "expectedOutput": "2"
      }
    ],
    "hiddenCases": [
      {
        "input": "-3",
        "expectedOutput": "-3"
      },
      {
        "input": "1 -2 -3",
        "expectedOutput": "1"
      },
      {
        "input": "-2 1",
        "expectedOutput": "1"
      },
      {
        "input": "-10 9 20 null null 15 7",
        "expectedOutput": "42"
      },
      {
        "input": "50 20 30 10 40 25 35 5 15 32 45 22 28 33 42 1 9 11 19 31 37 43 48 0 4 8 14 16 18 21 24 27 29 34 36 39 41 44 46 47 null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null null",
        "expectedOutput": "351"
      },
      {
        "input": "100 -50 50 -25 25 -12 12 -6 6 -3 3 -1 1 0 -100 100 null null null null null null null null null null null null null null",
        "expectedOutput": "181"
      },
      {
        "input": "0",
        "expectedOutput": "0"
      },
      {
        "input": "10 2 10 20 1 null -25 null null null null 3 4",
        "expectedOutput": "42"
      }
    ]
  },

  {
    "title": "Trapping Rain Water",
    "difficulty": "HARD" as const,
    "description": "Given an array height representing elevation map bars, compute how much water can be trapped after raining.",
    "inputFormat": "Single line: space-separated integers representing height array.",
    "outputFormat": "Single integer representing total trapped water.",
    "constraints": "1 <= height.length <= 2 * 10^4, 0 <= height[i] <= 10^5",
    "tags": ["array", "two-pointers", "dynamic-programming", "stack"],
    "sampleCases": [
      {
        "input": "0 1 0 2 1 0 1 3 2 1 2 1",
        "expectedOutput": "6"
      },
      {
        "input": "4 2 0 3 2 5",
        "expectedOutput": "9"
      }
    ],
    "hiddenCases": [
      {
        "input": "1",
        "expectedOutput": "0"
      },
      {
        "input": "5 4 3 2 1",
        "expectedOutput": "0"
      },
      {
        "input": "1 2 3 4 5",
        "expectedOutput": "0"
      },
      {
        "input": "2 0 2",
        "expectedOutput": "2"
      },
      {
        "input": "3 0 2 0 4",
        "expectedOutput": "7"
      },
      {
        "input": "0 0 0 0",
        "expectedOutput": "0"
      },
      {
        "input": "5 0 5",
        "expectedOutput": "5"
      },
      {
        "input": "5 2 1 2 1 5 1 2 1 2 1 5 1 2 1 2 1 5 1 2 1 2 1 5 1 2 1 2 1 5",
        "expectedOutput": "86"
      }
    ]
  },
  {
    "title": "Minimum Window Substring",
    "difficulty": "HARD" as const,
    "description": "Given two strings s and t, return the minimum window substring of s such that all characters of t (including duplicates) are included. If no such substring exists, return an empty string.",
    "inputFormat": "First line: string s. Second line: string t.",
    "outputFormat": "Single string representing the minimum window substring.",
    "constraints": "1 <= s.length, t.length <= 10^5, s and t consist of uppercase and lowercase English letters",
    "tags": ["hash-table", "string", "sliding-window"],
    "sampleCases": [
      {
        "input": "acbbaca\naba",
        "expectedOutput": "baca"
      },
      {
        "input": "aabbcc\nabc",
        "expectedOutput": "abbc"
      }
    ],
    "hiddenCases": [
      {
        "input": "a\na",
        "expectedOutput": "a"
      },
      {
        "input": "a\naa",
        "expectedOutput": ""
      },
      {
        "input": "ADOBECODEBANC\nABC",
        "expectedOutput": "BANC"
      },
      {
        "input": "abcd\nbd",
        "expectedOutput": "bcd"
      },
      {
        "input": "bba\nab",
        "expectedOutput": "ba"
      },
      {
        "input": "abcde\nf",
        "expectedOutput": ""
      },
      {
        "input": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaa",
        "expectedOutput": "aaaaaaaaaaaaaaaaaaaaaaaaa"
      },
      {
        "input": "aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz\nzyxwvutsrqponmlkjihgfedcba",
        "expectedOutput": "abbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyz"
      }
    ]
  },
  {
    "title": "Wildcard Matching",
    "difficulty": "HARD",
    "description": "Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' and '*'. '?' matches any single character. '*' matches any sequence of characters (including empty). The matching must cover the entire string.",
    "inputFormat": "First line: string s. Second line: string p.",
    "outputFormat": "Boolean value (true/false).",
    "constraints": "0 <= s.length, p.length <= 2000, s contains lowercase English letters, p contains lowercase English letters, '?' or '*'",
    "tags": ["string", "dp", "greedy"],
    "sampleCases": [
      {
        "input": "aa\na",
        "expectedOutput": "false"
      },
      {
        "input": "aa\n*",
        "expectedOutput": "true"
      }
    ],
    "hiddenCases": [
      {
        "input": "cb\n?a",
        "expectedOutput": "false"
      },
      {
        "input": "\n*",
        "expectedOutput": "true"
      },
      {
        "input": "\n?",
        "expectedOutput": "false"
      },
      {
        "input": "abcde\na*e",
        "expectedOutput": "true"
      },
      {
        "input": "abcde\na*d",
        "expectedOutput": "false"
      },
      {
        "input": "abcd\n****",
        "expectedOutput": "true"
      },
      {
        "input": "abcd\na*c?",
        "expectedOutput": "true"
      },
      {
        "input": "mississippi\nm*iss*?pi",
        "expectedOutput": "true"
      }
    ]
  },
  {
    "title": "Best Time to Buy and Sell Stock III",
    "difficulty": "HARD",
    "description": "Given an array prices where prices[i] is the price of a stock on day i, return the maximum profit with at most two transactions. You must sell before buying again.",
    "inputFormat": "First line: space-separated integers representing prices.",
    "outputFormat": "Single integer representing maximum profit.",
    "constraints": "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^5",
    "tags": ["array", "dynamic-programming"],
    "sampleCases": [
      {
        "input": "1 2 3 4 5",
        "expectedOutput": "4"
      },
      {
        "input": "7 6 4 3 1",
        "expectedOutput": "0"
      }
    ],
    "hiddenCases": [
      {
        "input": "3 3 5 0 0 3 1 4",
        "expectedOutput": "6"
      },
      {
        "input": "1",
        "expectedOutput": "0"
      },
      {
        "input": "2 4",
        "expectedOutput": "2"
      },
      {
        "input": "2 1 2 0 1",
        "expectedOutput": "2"
      },
      {
        "input": "5 2 4 0 1",
        "expectedOutput": "3"
      },
      {
        "input": "1 2 4 2 5 7 2 4 9 0",
        "expectedOutput": "13"
      },
      {
        "input": "6 1 3 2 4 7",
        "expectedOutput": "7"
      },
      {
        "input": "2 1 4 5 2 9 7",
        "expectedOutput": "11"
      }
    ]
  },
]