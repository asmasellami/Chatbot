import { ChatbotService } from './../services/chatbot.service';
import { Component, OnInit } from '@angular/core';
import { Fichier } from '../model/file.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
  fichiers: Fichier[] = [];
  fichierSelectionne?: File;
  totalFiles: number = 0;
  recentFile: Fichier | null = null;
  filesToday: number = 0;
  isDragOver = false;

  constructor(
    private ChatbotService: ChatbotService,
    private toastr: ToastrService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerFichiers();
  }

  chargerFichiers(): void {
    this.ChatbotService.getAllFiles().subscribe((data) => {
      this.fichiers = data;
      this.updateStatistics();
    });
  }

  updateStatistics(): void {
    this.totalFiles = this.fichiers.length;
    this.recentFile =
      this.fichiers.length > 0
        ? this.fichiers.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
          )
        : null;

    const today = new Date('2025-07-27');
    this.filesToday = this.fichiers.filter((fichier) => {
      const fileDate = new Date(fichier.date);
      return (
        fileDate.getDate() === today.getDate() &&
        fileDate.getMonth() === today.getMonth() &&
        fileDate.getFullYear() === today.getFullYear()
      );
    }).length;
  }

  onFileSelected(event: any): void {
    this.fichierSelectionne = event.target.files[0];
  }
  ajouterfichier(): void {
    if (this.fichierSelectionne) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          const isValid =
            Array.isArray(json) &&
            json.every((obj: any) => obj.tag && obj.patterns && obj.responses);

          if (!isValid) {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Le fichier ne respecte pas la structure attendue.',
              confirmButtonText: 'OK',
            });
            return;
          }
          this.ChatbotService.uploadFile(this.fichierSelectionne!).subscribe(
            () => {
              this.chargerFichiers();
              Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Fichier ajouté avec succès !',
                confirmButtonText: 'OK',
              });
            },
            () => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Erreur lors de l'ajout du fichier",
                confirmButtonText: 'OK',
              });
            }
          );
        } catch {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Le fichier n’est pas un JSON valide.',
            confirmButtonText: 'OK',
          });
        }
      };
      reader.readAsText(this.fichierSelectionne);
    }
  }

  supprimerfichier(id: number): void {
    Swal.fire({
      title: 'Vous êtes sûr de vouloir supprimer ?',
      text: 'Vous ne pourrez pas revenir en arrière !',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#1DA2B4',
      confirmButtonText: 'supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ChatbotService.deleteFile(id).subscribe(
          () => {
            this.chargerFichiers();
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Fichier supprimé avec succès !',
              confirmButtonText: 'OK',
            });
          },
          (error) => {
            console.error(
              `Erreur lors de la suppression du fichier avec ID ${id}`,
              error
            );
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression du fichier',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }

  consulterFichier(id: number): void {
    this.ChatbotService.getFileContent(id).subscribe(
      (content: string) => {
        Swal.fire({
          title: 'Contenu du fichier',
          html: `<pre style="text-align: left; max-height: 400px; overflow-y: auto;">${this.formatJson(
            content
          )}</pre>`,
          showConfirmButton: true,
          confirmButtonText: 'Fermer',
          width: '800px',
        });
      },
      (error) => {
        this.toastr.error(
          'Erreur lors de la récupération du contenu du fichier'
        );
      }
    );
  }

  private formatJson(json: string): string {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } catch (e) {
      return json;
    }
  }

  modifierFichier(id: number): void {
    this.router.navigate(['/update-file', id]);
  }

  onLogout() {
    this.authService.logout();
  }
}
