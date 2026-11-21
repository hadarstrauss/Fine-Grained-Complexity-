use Cwd qw(abs_path);
$ENV{'TEXMFHOME'} = abs_path('.texmf');
$biber = '"' . abs_path('.texmf/bin/universal-darwin/biber') . '" %O %B';
$pdf_mode = 1;
