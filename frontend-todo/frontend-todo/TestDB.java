import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/todosdb";
        String user = "postgres";
        String password = "Lokeshr@64";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to DB");
            String query = "SELECT \n" +
                           "  tc.table_schema, \n" +
                           "  tc.constraint_name, \n" +
                           "  tc.table_name, \n" +
                           "  kcu.column_name, \n" +
                           "  ccu.table_schema AS foreign_table_schema,\n" +
                           "  ccu.table_name AS foreign_table_name,\n" +
                           "  ccu.column_name AS foreign_column_name \n" +
                           "FROM \n" +
                           "  information_schema.table_constraints AS tc \n" +
                           "  JOIN information_schema.key_column_usage AS kcu\n" +
                           "    ON tc.constraint_name = kcu.constraint_name\n" +
                           "    AND tc.table_schema = kcu.table_schema\n" +
                           "  JOIN information_schema.constraint_column_usage AS ccu\n" +
                           "    ON ccu.constraint_name = tc.constraint_name\n" +
                           "    AND ccu.table_schema = tc.table_schema\n" +
                           "WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='todos';";
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next()) {
                System.out.println("Table: " + rs.getString("table_name") + " -> " + rs.getString("foreign_table_name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
