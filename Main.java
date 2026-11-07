
import java.util.Scanner;

public class Main
{
    public static void main(String args[])
    {
        Scanner sc = new Scanner(System.in);

        System.out.println("================================");
        System.out.println("       UNDER THE MOONLIGHT");
        System.out.println("================================");

        System.out.print("\nEnter your name: ");
        String name = sc.nextLine();

        GameCharacter gabriel = new GameCharacter(
            "Gabriel",
            "Gubbi",
            "Gentle, caring and playful",
            "Music, beaches and spending time with you",
            "Being ignored and seeing you sad",
            "Your childhood best friend"
        );

        Story game = new Story(name, sc, gabriel);

        System.out.println("\nYour story with Gabriel begins...");
        System.out.println("\nPress ENTER to begin.");
        sc.nextLine();

        game.startStory();

        sc.close();
    }
}
