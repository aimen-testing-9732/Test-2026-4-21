<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include('dompdf/autoload.inc.php');

use Dompdf\Dompdf;
use Dompdf\Options;

include('common_link.php');

$sql = "SELECT content FROM tnc_template  WHERE tmp_id = 'TNC38'";

$tmpQuery = mysqli_query($con, $sql);
if ($tmpQuery && mysqli_num_rows($tmpQuery) > 0) {

    $row = mysqli_fetch_assoc($tmpQuery);



    $name = 'John Doe';
    $pan = 'ABCDE1234F';
    $contact = '+91 8723474576';
    $email = 'John@example.com';
    $address = '123 Test Street, Test City';
    $pageBrake = '<div class="page-break"></div>';
    $data = $row['content'];
    $date = date('d-m-Y');
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
            $pan,
            $address,
            $date,
            $pageBrake,
            $companyAddress,
            $companyEmail,
            $companyPhone,
            $RAName,
            $RA_state,
            $RASebiRegNo,
            $RaSebiRegDate,
            $ComplianceOfficerName,
            $ComplianceOfficerEmail,
            $ComplianceOfficerPhone,
            $ComplianceOfficerTime,
            $customerCareOfficerName,
            $customerCareOfficerEmail,
            $customerCareOfficerPhone,
            $customerCareOfficerTime
        ],
        $data
    );

    $html = '
<html>
<head>
<style>
@page {
    size: A4;
    margin: 2mm 2mm 2mm 5mm;
}

/*body {
    font-family: Arial, sans-serif;
    line-height: 1.2;
    font-size: 12pt;
}*/

table {
    width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    word-wrap: break-word !important;

}

/*td, th {
    padding: 6px;
    vertical-align: top !important;
    white-space: normal !important;
}*/

tr, td, th {
    page-break-inside: avoid !important;
}

/*th {
   
    font-weight: bold;
    text-align: left;
}*/
 .page-break {
                    page-break-after: always;
                }

</style>
</head>
<body>
' . $preparedData . '
<script type="text/php">
if ( isset($pdf) ) { 
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

    //echo $html;
    //exit();
    mysqli_free_result($tmpQuery);
    mysqli_close($con);

    // $options = new Options();
    // $options->set('isHtml5ParserEnabled', true);
    // $options->set('isPhpEnabled', true);
    // $options->set('defaultFont', 'DejaVu Sans');
    // $options->set('isRemoteEnabled', true);

    // $dompdf = new Dompdf($options);
    // $dompdf->loadHtml($html);
    // $dompdf->setPaper('A4', 'portrait');
    // $dompdf->render();

    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isPhpEnabled', true);
    $options->set('defaultFont', 'DejaVu Sans');
    $options->set('isRemoteEnabled', true);

    $dompdf = new Dompdf($options);

    libxml_use_internal_errors(true);

    $doc = new DOMDocument();
    $doc->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

    $html = $doc->saveHTML();


    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    $filename = 'saved_content_' . date('Y-m-d_H-i-s') . '.pdf';
    $dompdf->stream($filename, ['Attachment' => true]);
} else {
    json_encode(array('status' => false, 'message' => 'something Went Wrong'));
}

//echo update 2.