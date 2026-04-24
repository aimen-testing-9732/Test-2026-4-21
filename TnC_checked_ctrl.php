
<?php

session_start();
include('dompdf/autoload.inc.php');
include "common_link.php";

use Dompdf\Dompdf;
use Dompdf\Options;

function generateUniqueFileName($user_id)
{
    $char_set = "0123456789";
    $max = strlen($char_set) - 1;
    $ord_id = $user_id . "_";
    for ($i = 1; $i <= 4; $i++) {
        $ord_id .= $char_set[mt_rand(0, $max)];
    }
    return $ord_id;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['subs_id'])) {
    $cur_date = date('d-m-Y');
    $cur_time = date('H:i:s');

    $data['subs_id'] = trim(mysqli_real_escape_string($con, $_POST['subs_id']));
    $user_id = trim(mysqli_real_escape_string($con, $_POST['subs_id']));
    $jsonData = json_encode($data);

    $httpCall = new httpCall("TnC_checked_db.php", encrypt($jsonData));
    $httpReturn = $httpCall->httpPost();

    $sql = "SELECT content FROM tnc_template  WHERE tmp_id = 'TNC38'";

    $tmpQuery = mysqli_query($con, $sql);
    if ($tmpQuery && mysqli_num_rows($tmpQuery) > 0) {
        $row = mysqli_fetch_assoc($tmpQuery);
    } else {
        echo json_encode(array('sts' => false, 'msg' => 'something Went Wrong'));
        mysqli_close($con);
        exit();
    }

    $resp = array();
    $userData = json_decode($httpReturn, true);
    if ($userData === null && json_last_error() !== JSON_ERROR_NONE) {
        $resp['sts'] = false;
        $resp['msg'] = "Error: Invalid Data received";
        mysqli_close($con);
        echo json_encode($resp);
        exit;
    }

    $status = isset($userData['status']) ? $userData['status'] : null;
    if (!$status) {
        $resp['sts'] = false;
        $resp['msg'] = "Error :- " . $userData['message'];
        mysqli_close($con);
        echo json_encode($resp);
        exit;
    }

    $data = $userData['data'];

    $name = isset($data['name']) ? $data['name'] : '';
    $panNo = isset($data['panNo']) ? $data['panNo'] : null;
    $contact = isset($data['contact']) ? $data['contact'] : '';
    $TnC_status = isset($data['TnC_status']) ? $data['TnC_status'] : '';
    $TnC_Applied = isset($data['TnC_Applied']) ? $data['TnC_Applied'] : '';
    $TnC_DidId = isset($data['TnC_DidId']) ? $data['TnC_DidId'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $gwtId = isset($data['TnC_gwtId']) ? $data['TnC_gwtId'] : '';
    $address = isset($data['custFullAddress']) ? $data['custFullAddress'] : '';


    if ($TnC_status == 1) {
        $resp['sts'] = true;
        $resp['msg'] = "Terms and Conditions Accepted.";
        echo json_encode($resp);
        mysqli_close($con);
        exit;
    }

    $currentDate = date("d-m-Y");

    $lastResponse = [];

    $signatureImage = '../' . $signatureImage;
    $pageBrake = '<div class="page-break"></div>';
    $data = $row['content'];
    
    $preparedData = str_replace(
        [
            '[Client-Name]',
            '[Client-Contact-No]',
            '[Client-Email]',
            '[Client-Pan]',
            '[Client-Address]',
            '[Date]',
            '[Page-Break]',
            '[RA-Address]',
            '[RA-Email]',
            '[RA-Phone]',
            '[RA-Name]',
            '[RA-State]',
            '[RA-RegNo]',
            '[RA-SEBI-RegDate]',
            '[ComplianceOfficerName]',
            '[ComplianceOfficerEmail]',
            '[ComplianceOfficerPhone]',
            '[ComplianceOfficerTime]',
            '[CustomerCareOfficerName]',
            '[CustomerCareOfficerEmail]',
            '[CustomerCareOfficerPhone]',
            '[CustomerCareOfficerTime]'
        ],
        [
            $name,
            $contact,
            $email,
            $panNo,
            $address,
            $currentDate,
            $pageBrake,

            $companyAddress,
            $companyEmail,
            $companyPhone,
            $RAName,
            $RA_state,
            $RASebiRegNo,
            $RaSebiRegDate,
            // Compliance Officer variables
            $ComplianceOfficerName,
            $ComplianceOfficerEmail,
            $ComplianceOfficerPhone,
            $ComplianceOfficerTime,
            // Customer Care Officer variables
            $customerCareOfficerName,
            $customerCareOfficerEmail,
            $customerCareOfficerPhone,
            $customerCareOfficerTime
        ],
        $data
    );

    $TnC_html = '
            <html>
            <head>
            <style>
            @page {
                size: A4;
                margin: 10mm 10mm 10mm 20mm;
            }

            body {
                font-family: Arial, sans-serif;
                line-height: 1.2;
                font-size: 12pt;
            }

            table {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                word-wrap: break-word !important;
            }

            td, th {
                padding: 6px;
                vertical-align: top !important;
                white-space: normal !important;
            }

            tr, td, th {
                page-break-inside: avoid !important;
            }

            th {
                font-weight: bold;
                text-align: left;
            }
            .page-break {
                page-break-after: always;
            }

            </style>
            </head>
            <body>
            ' . $preparedData . '
            <script type="text/php">
                if (isset($pdf)) { 
                    $font = $fontMetrics->get_font("DejaVu Sans", "normal"); 
                    $size = 8; 
                    $y = 800; 
                    $x = 50; 
                    $pdf->page_text($x, $y, "Page {PAGE_NUM}", $font, $size); 
                } 
            </script>

            </body>
            </html>
            ';
    mysqli_free_result($tmpQuery);


    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isPhpEnabled', true);
    $options->set('defaultFont', 'Arial');
    $options->set('isRemoteEnabled', true);

    $dompdf = new Dompdf($options);

    $dompdf->loadHtml($TnC_html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    $pdfOutput = $dompdf->output();

    $fileName = "TnC_" . $user_id . $panNo . ".pdf";
    $filePath = $main_path . 'TnC_Files/' . $fileName;

    file_put_contents($filePath, $pdfOutput);


    $fileToSign = $filePath;
    $pdfBase64 = base64_encode(file_get_contents($fileToSign));

    $authHeader = base64_encode($clientId . ':' . $clientSecret);

    $signClientEmail = $email;
    $signClientName = $name;

    $signPayload = [
        "signers" => [
            [
                "identifier" => $signClientEmail,
                "name" => $signClientName,
                "sign_type" => "aadhaar",
                "reason" => ''
            ]
        ],
        "expire_in_days" => 10,
        "display_on_page" => "all",
        "notify_signers" => false,
        "send_sign_link" => false,
        "generate_access_token" => true,
        "file_name" => $fileName,
        "file_data" => $pdfBase64,

        "signature_verification" => [
            $signClientEmail => [
                "abort_on_fail" => true,
                "max_attempt" => 1,
                "rules" => [
                    [
                        "operation" => "AND",
                        "conditions" => [
                            [
                                "field" => "name",
                                "match_type" => "fuzzy",
                                "value" => $signClientName,
                                "threshold" => "80"
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];

    $jsonPost = json_encode($signPayload);
    $ch = curl_init();

    switch ($digo_env) {
        case 'uat':
            $url = "https://ext.digio.in:444/v2/client/document/uploadpdf";
            break;
        case 'prod':
            $url = "https://api.digio.in/v2/client/document/uploadpdf";
            break;
        default:
            $url = "";
            break;
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPost);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Basic ' . $authHeader
    ));

    $digioResponse = curl_exec($ch);
    $response = json_decode($digioResponse, true);

    $did_id = $response['id'];
    $gwt_id = $response['access_token']['id'];
    $signer_mail_id = $response['signing_parties'][0]['identifier'];

    // if (curl_errno($ch)) {
    //     echo 'cURL Error: ' . curl_error($ch) . "<br>";
    // } else {
    //     var_dump($digioResponse);
    // }

    // $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // echo "<br>Response Code: " . $responseCode;

    curl_close($ch);

    $updateData = [
        'did_id' => $did_id,
        'gwt_id' => $gwt_id,
        'signer_mail_id' => $signer_mail_id,
        'user_id' => $user_id
    ];

    $updateJsonData = json_encode($updateData);

    $httpCall = new httpCall("TnC_saveDid_db.php", encrypt($updateJsonData));
    $httpReturn = $httpCall->httpPost();

    $digioData = json_decode($httpReturn, true);
    if (isset($digioData['status']) && $digioData['status']) {
        $lastResponse['did'] = $did_id;
        $lastResponse['gwt'] = $gwt_id;
        $lastResponse['email'] = $signer_mail_id;
        $lastResponse['sts'] = true;
    } else {
        $lastResponse['sts'] = false;
        $lastResponse['data'] = $httpReturn;
    }

    echo json_encode($lastResponse);
}

mysqli_close($con);
