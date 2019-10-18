<?header("Access-Control-Allow-Origin: *");

$key='Belu4560Ska';

function changeVer(){
$a=file_get_contents('data.txt');
$b=json_decode($a,true);
$b["version"]++;
$b["time"]=time();
file_put_contents('data.txt',json_encode($b));
}

if(isset($_GET['fileDB'])){
echo file_get_contents('main.db');
die();
}

if(isset($_GET['dataFile'])){
echo file_get_contents('data.txt');
die();
}

if(!isset($_POST['data']) OR !isset($_POST['key']) OR $_POST['key']!=$key) die();

changeVer();
file_put_contents('brokenBD',$_POST['data']);
echo "Succ";
?>