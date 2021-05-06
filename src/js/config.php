<?php
$serverInfo = [
    'env' => [
        'instance' => getenv('DAM_INSTANCE'),
        'server' => getenv('DAM_FE_URL'),
        'serverRoot' => getenv('DAM_REST_URL'),
        'serverRootStream' => getenv('DAM_STREAM_URL'),
        'filesServerRoot' => getenv('DAM_REST_URL').'get/',
        'status' => 'prod'
    ]
];

$info = isset($serverInfo[$_SERVER['SERVER_NAME']]) ? $serverInfo[$_SERVER['SERVER_NAME']] : $serverInfo['env'];

$json = file_get_contents('config.js');

if($info){
    $json = str_replace(['##INSTANCE##', '##SERVER##', '##SERVER_ROOT##', '##SERVER_ROOT_STREAM##', '##FILE_SERVER_ROOT##', '##STATUS##'],
        [$info['instance'], $info['server'], $info['serverRoot'], $info['serverRootStream'], $info['filesServerRoot'], $info['status']],
        $json);
}
echo $json;
