package game

import "fmt"

type GameConn struct {
	broadcast chan string
}

func (p Player) SendPlayerEvent() {
}

func (p Player) leave() {

}

func (g Game) sendAllPlayers(s string) {
	fmt.Println("Sending message:", s)
	go func() { g.broadcast <- s }()
}

func (g Game) run() {

	for {
		select {
		case message := <-g.broadcast:
			fmt.Println("Broadcasting:", message)
			for name, p := range g.players {
				fmt.Println("Sending to name", name)
				p.ws.WriteJSON(message)
			}
		}
	}
}
