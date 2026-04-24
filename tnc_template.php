<?php
session_start();
//$setNoPermission=true;

include "common_link.php";

if (Auth_ckeck($_SESSION[$sessionUser], $_SESSION['admin_pass']) == false) {
    mysqli_close($con);
    header("location:logout");
    exit;
} else {

    if (!isset($getAccess['permissions']['View Tnc Template'])) {
        mysqli_close($con);

        header("location:page404");
        exit();
    }


    $datapass = 'Tnc38';
    $encryptdatapass = encrypt($datapass);
    $calhttp = new httpCall("fetch_tnc_template_content_db.php", $encryptdatapass);
    $httpReturn = $calhttp->httpPost();
    // $tempjosnData = decrypt($httpReturn);
    $tempData = json_decode($httpReturn, true);
    $tempContent = $tempData['Data'];

    $calhttp2 = new httpCall("fetch_tnc_template_image_db.php", $encryptdatapass);
    $httpReturn2 = $calhttp2->httpPost();
    // $tempjosnData = decrypt($httpReturn);
    $tempDataImage = json_decode($httpReturn2, true);
    $tempImage = $tempDataImage['Data'];
?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- ----------------font awesome------------------- -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
        <!-- ---------------------bootstrap--------------------- -->
        <!-- Pagination CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="pagination/simplePagination.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jodit/4.5.19/es2018/jodit.min.css">
        <!-- ------------------main css----------------- -->
        <link rel="stylesheet" href="css/style.css">
        <title>Admin Panel</title>
        <style>
            .jodit-wysiwyg {
                width: 794px;
                min-height: 1123px;
                margin: auto;
                padding: 40px;
                background: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            }
        </style>
    </head>

    <body>
        <section class="admin-body">
            <div class="body-wrap">

                <!-- model end -->
                <?php include "menu.php" ?>
                <div class="right-tab">
                    <?php include "header.php" ?>
                    <div class="content-title">
                        <p><i class="fas fa-newspaper" style="color: #FFD43B;"></i> Terms and Conditions Template</p>
                    </div>
                    <!-- -------------------this div name is common for all , if you find difficulty plz check in the css "common-div"----- -->
                    <div class="common-div py-3">
                        <!-- ----------------workspace starts---------------- -->
                        <textarea id="editor" name="content" style="width:100%; height:400px;"><?php echo htmlspecialchars($tempContent); ?></textarea>
                        <div class="mt-4 border rounded p-3" style="background:#f9f9f9;">

                            <!-- UPLOAD + VARIABLES SIDE BY SIDE -->
                            <div class="gap-4 mb-4">

                                <div style="flex:1; min-width:300px;">
                                    <h4 class="text-black">⚡ Insert Client Dynamic Variables</h4>
                                    <div class="mt-3 d-flex flex-wrap gap-2">
                                        <button type="button" class="insertVarBtn   glow-on-hover pull-right w-100" data-value="[Client-Name]">
                                            <i class="fa-solid fa-plus pe-2 "></i> Name
                                        </button>
                                        <button type="button" class="insertVarBtn  glow-on-hover pull-right"
                                            data-value="[Client-Contact-No]">
                                            <i class="fa-solid fa-plus pe-2 "></i> Contact No
                                        </button>
                                        <button type="button" class="insertVarBtn  glow-on-hover pull-right"
                                            data-value="[Client-Email]">
                                            <i class="fa-solid fa-plus pe-2 "></i> Email ID
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[Client-Pan]">
                                            <i class="fa-solid fa-plus pe-2 "></i> PAN No
                                        </button>

                                        <button type="button" class="insertVarBtn  glow-on-hover pull-right"
                                            data-value="[Client-Address]">
                                            <i class="fa-solid fa-plus pe-2 "></i> Address
                                        </button>

                                        <button type="button" class="insertVarBtn  glow-on-hover pull-right"
                                            data-value="[Date]">
                                            <i class="fa-solid fa-plus pe-2 "></i> Current Date
                                        </button>

                                    </div>
                                </div>

                            </div>
                            <div class="gap-4 mb-4">
                                <div style="flex:1; min-width:300px;">
                                    <h4 class="text-black">⚡ Insert RA Dynamic Variables</h4>
                                    <div class="mt-3 d-flex flex-wrap gap-2">
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right w-100" data-value="[RA-Address]">
                                            <i class="fa-solid fa-plus pe-2"></i> RA Address
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-Email]">
                                            <i class="fa-solid fa-plus pe-2"></i> RA Email
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-Phone]">
                                            <i class="fa-solid fa-plus pe-2"></i> RA Phone
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-Name]">
                                            <i class="fa-solid fa-plus pe-2"></i> RA Name
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-State]">
                                            <i class="fa-solid fa-plus pe-2"></i> RA State
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-RegNo]">
                                            <i class="fa-solid fa-plus pe-2"></i> SEBI Reg No
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[RA-SEBI-RegDate]">
                                            <i class="fa-solid fa-plus pe-2"></i> SEBI Reg Date
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="gap-4 mb-4">
                                <div style="flex:1; min-width:300px;">
                                    <h4 class="text-black">⚡ Insert Compliance Officer Dynamic Variables</h4>
                                    <div class="mt-3 d-flex flex-wrap gap-2">
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right w-100" data-value="[ComplianceOfficerName]">
                                            <i class="fa-solid fa-plus pe-2"></i> Compliance Officer Name
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[ComplianceOfficerEmail]">
                                            <i class="fa-solid fa-plus pe-2"></i> Compliance Officer Email
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[ComplianceOfficerPhone]">
                                            <i class="fa-solid fa-plus pe-2"></i> Compliance Officer Phone
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[ComplianceOfficerTime]">
                                            <i class="fa-solid fa-plus pe-2"></i> Availability Time
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="gap-4 mb-4">
                                <div style="flex:1; min-width:300px;">
                                    <h4 class="text-black">⚡ Insert Customer Care Officer Dynamic Variables</h4>
                                    <div class="mt-3 d-flex flex-wrap gap-2">
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right w-100" data-value="[CustomerCareOfficerName]">
                                            <i class="fa-solid fa-plus pe-2"></i> Customer Care Name
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[CustomerCareOfficerEmail]">
                                            <i class="fa-solid fa-plus pe-2"></i> Customer Care Email
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[CustomerCareOfficerPhone]">
                                            <i class="fa-solid fa-plus pe-2"></i> Customer Care Phone
                                        </button>
                                        <button type="button" class="insertVarBtn glow-on-hover pull-right" data-value="[CustomerCareOfficerTime]">
                                            <i class="fa-solid fa-plus pe-2"></i> Availability Time
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 border rounded p-3" style="background:#f9f9f9;">

                            <!-- UPLOAD + VARIABLES SIDE BY SIDE -->
                            <div class="gap-4 mb-4">

                                <div style="flex:1; min-width:300px;">
                                    <h4 class="text-black">🔹 Page Break
                                    </h4>
                                    <div class="mt-3 d-flex flex-wrap gap-2">
                                        <button type="button" class="pdfConfig btn btn-warning" data-value="[Page-Break]">
                                            <i class="fa-solid fa-scissors"></i> Page Break
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <!-- Uploaded Images Block – Separate Row -->
                        <div class="mt-4 border rounded p-3" style="background:#f9f9f9;">
                            <div style="min-width:300px;">
                                <h4 class="text-black">📸 Upload Image</h4>
                                <div class="d-flex mt-2">
                                    <input type="file" id="imageUpload" name="image" class="form-control me-2" accept="image/*">
                                    <button type="button" id="uploadBtn" class="btn btn-success">Upload</button>
                                </div>
                            </div>
                            <div class="d-flex flex-wrap gap-2 mt-3">
                                <?php foreach ($tempImage as $images) {
                                    $imgPath = $pubHtml . "get-image?src=" . base64_encode(encrypt($images['file_name'])) . "&scope=" . base64_encode(encrypt('Tnc_Image'));
                                ?>
                                    <div class="card shadow-sm position-relative border-0"
                                        style="width:80px; border-radius:6px; overflow:hidden;">

                                        <img src="<?= $imgPath ?>"
                                            class="card-img-top"
                                            alt="<?= htmlspecialchars($images['file_name']) ?>"
                                            style="height:50px; object-fit:cover; border-bottom:1px solid #eee;">

                                        <button type="button"
                                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 deleteImgBtn"
                                            data-file="<?= $images['file_name'] ?>"
                                            title="Delete Image"
                                            style="border-radius:50%; height:22px; line-height:10px;">
                                            ×
                                        </button>

                                        <div class="card-body p-1 text-center">
                                            <button type="button"
                                                class="insertImgBtn btn btn-info text-white btn-sm w-100"
                                                data-value="<?= $imgPath ?>"
                                                style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                                <i class="fa-solid fa-plus pe-1"></i> Insert
                                            </button>
                                        </div>
                                    </div>
                                <?php } ?>
                            </div>
                        </div>

                        <br>
                        <button type="submit" id="saveContentBtn" name='postbtn' value="sub" class="btn btn-primary">💾 Save template</button>
                        <a href="<?php echo $pubHtml ?>tnc-template-download">
                            <button type="button" class="btn btn-success ms-2"> <i class="fa-solid fa-arrow-down pe-1"></i> Download PDF</button>
                        </a>
                        <!-- Main content -->
                        <div id="error-alert" class="alert alert-danger alert-dismissible fade" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 1050; min-width: 250px;">
                            <strong>Error!</strong> All the input fields are required.
                        </div>
                        <!-- ----------------workspace ends---------------- -->
                    </div>
                    <!-- -------------------footer starts-------------------- -->
                    <?php include "footer.php" ?>
                    <!-- ------------------------footer ends----------------- -->
                </div>
            </div>
        </section>
        <!-- ------------------------bootstrap js---------------------- -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        <!-- ------------------jquery-------- -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jodit/4.5.19/es2018/jodit.min.js"></script>

        <!-- ---------------- Pagination Js---------------- -->
        <script type="text/javascript" src="pagination/simplePagination.js"></script>
        <!-- Fab Admin App -->
        <script src="app_js/common.js"></script>
        <script src="app_js/tnc_template.js"></script>
        <script>
            function toggleBurger() {
                const burger = document.getElementById('burger');
                const rightTab = document.querySelector('.right-tab ');
                const isShrunk = burger.classList.toggle('shrink');

                if (window.innerWidth <= 992) {
                    if (isShrunk) {
                        rightTab.style.marginLeft = '20px';
                    } else {
                        rightTab.style.marginLeft = '20px';
                    }
                }
            }
            document.querySelectorAll('.list-menu li a').forEach(menuItem => {
                menuItem.addEventListener('click', () => {
                    const chartTable = document.querySelector('.chart-table');
                    chartTable.style.display = 'block';
                    chartTable.classList.add('cube-animation');
                    setTimeout(() => {
                        chartTable.classList.remove('cube-animation');
                    }, 600);
                });
            });
        </script>
    </body>

    </html>
<?php
}
mysqli_close($con);
?>